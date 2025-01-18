const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const fs = require('fs').promises;
const { PDFDocument, rgb } = require('pdf-lib'); 
const fontkit = require('@pdf-lib/fontkit');  // Add this line
const path = require('path');
const OpenAI = require('openai');

ffmpeg.setFfmpegPath(ffmpegPath);

class VideoProcessor {
    constructor(openAiApiKey) {
        this.openai = new OpenAI({
            apiKey: ""
        });
    }

    async copyFile(source, target) {
        console.log(`Copying file from ${source} to ${target}`);
        try {
            // Read the source file
            const data = await fs.readFile(source);
            // Write to the target path
            await fs.writeFile(target, data);
            console.log('File copy completed');
            
            // Verify the file exists and has content
            const stats = await fs.stat(target);
            console.log(`Copied file size: ${stats.size} bytes`);
            if (stats.size === 0) {
                throw new Error('Copied file is empty');
            }
            return true;
        } catch (error) {
            console.error('Error during file copy:', error);
            throw error;
        }
    }

    async saveVideo(sourcePath, outputDir) {
        try {
            console.log('Starting video save process...');
            console.log('Source path:', sourcePath);
            console.log('Output directory:', outputDir);

            // Get file extension
            const videoExt = path.extname(sourcePath);
            const outputVideoPath = path.join(outputDir, `original${videoExt}`);
            console.log('Target video path:', outputVideoPath);

            // Copy the file
            await this.copyFile(sourcePath, outputVideoPath);
            
            // Double-check file exists
            const exists = await fs.access(outputVideoPath)
                .then(() => true)
                .catch(() => false);

            if (!exists) {
                throw new Error('Video file not found after copying');
            }

            console.log('Video save completed successfully');
            return outputVideoPath;
        } catch (error) {
            console.error('Error in saveVideo:', error);
            throw error;
        }
    }

    async processVideo(videoPath, outputDir) {
        console.log('Starting video processing...');
        console.log('Video path:', videoPath);
        console.log('Output directory:', outputDir);

        try {
            // Create output directory
            await fs.mkdir(outputDir, { recursive: true });
            console.log('Output directory created/verified');

            // Save video file first
            console.log('Saving video file...');
            const savedVideoPath = await this.saveVideo(videoPath, outputDir);
            console.log('Video saved to:', savedVideoPath);

            // List files in directory after video save
            const filesAfterVideoSave = await fs.readdir(outputDir);
            console.log('Files after video save:', filesAfterVideoSave);

            // Extract audio from the original video path
            const audioPath = path.join(outputDir, 'audio.wav');
            await this.extractAudio(videoPath, audioPath);
            console.log('Audio extracted successfully');

            // Transcribe audio
            const transcriptionResult = await this.transcribeAudio(audioPath);
            const transcript = transcriptionResult.text;
            console.log('Transcription completed');

            // Generate summary
            const processedData = await this.generateSummary(transcript);
            console.log('Summary generated');

            // Create PDF
            const pdfPath = path.join(outputDir, 'transcript.pdf');
            await this.createPDF(processedData, pdfPath);
            console.log('PDF created');

            // Save text file
            const txtPath = path.join(outputDir, 'transcript.txt');
            const txtContent = `Podsumowanie:\n\n${processedData.summary}\n\nDialog:\n\n` + 
                processedData.dialogue.map(entry => `${entry.speaker}: ${entry.text}`).join('\n\n');
            await fs.writeFile(txtPath, txtContent, 'utf8');
            console.log('Text file saved');

            // Clean up audio file
            await fs.unlink(audioPath).catch(err => 
                console.error('Warning: Could not delete audio file:', err)
            );

            // Final verification
            const finalFiles = await fs.readdir(outputDir);
            console.log('Final files in directory:', finalFiles);

            if (!finalFiles.some(file => file.startsWith('original'))) {
                throw new Error('Video file missing from final output');
            }

            return {
                ...processedData,
                pdfPath,
                txtPath,
                videoPath: savedVideoPath
            };
        } catch (error) {
            console.error('Error in processVideo:', error);
            throw error;
        }
    }


    async extractAudio(videoPath, outputPath) {
        return new Promise((resolve, reject) => {
            ffmpeg(videoPath)
                .toFormat('wav')
                .outputOptions([
                    '-acodec', 'pcm_s16le',
                    '-ar', '16000',
                    '-ac', '1'  // Convert to mono
                ])
                .save(outputPath)
                .on('end', resolve)
                .on('error', reject);
        });
    }

    async transcribeAudio(audioPath) {
        try {
            const audioFile = await fs.readFile(audioPath);
            const fileName = path.basename(audioPath);
    
            const formData = new FormData();
            const blob = new Blob([audioFile], { type: 'audio/wav' });
            const file = new File([blob], fileName, { type: 'audio/wav' });
    
            // Simplified transcription request
            const response = await this.openai.audio.transcriptions.create({
                file: file,
                model: "whisper-1",
                language: "pl"
            });
    
            return response;
        } catch (error) {
            console.error('Transcription error:', error);
            throw error;
        }
    }
    
    async generateSummary(transcript) {
        try {
            const completion = await this.openai.chat.completions.create({
                model: "gpt-4",
                messages: [
                    {
                        role: "system",
                        content: `Jesteś ekspertem w analizie rozmów i identyfikacji mówców. 
                        Przeanalizuj transkrypcję i zidentyfikuj różnych mówców. 
                        Oznacz każdego mówcę jako "Mówca 1", "Mówca 2" itd., 
                        i przedstaw rozmowę w formie dialogu.
                        
                        Odpowiedź powinna zawierać:
                        1. Lista mówców (np. "Mówcy: Mówca 1, Mówca 2")
                        2. Krótkie podsumowanie rozmowy
                        3. Dialog w formacie:
                        Mówca X: [treść wypowiedzi]
                        Mówca Y: [treść wypowiedzi]
                        itd.`
                    },
                    {
                        role: "user",
                        content: transcript
                    }
                ]
            });
    
            const response = completion.choices[0].message.content;
            
            // Parse the response into structured format
            const sections = response.split('\n\n');
            const speakers = sections[0].replace('Mówcy:', '').trim().split(',').map(s => s.trim());
            const summary = sections[1];
            const dialogueText = sections.slice(2).join('\n');
            
            // Parse dialogue into structured format
            const dialogue = dialogueText.split('\n')
                .filter(line => line.trim())
                .map(line => {
                    const [speaker, ...text] = line.split(':');
                    return {
                        speaker: speaker.trim(),
                        text: text.join(':').trim()
                    };
                });
    
            return {
                speakers,
                dialogue,
                summary
            };
        } catch (error) {
            console.error('Summary generation error:', error);
            throw error;
        }
    }

    async createPDF(dialogueData, outputPath) {
        try {
            const pdfDoc = await PDFDocument.create();
            pdfDoc.registerFontkit(fontkit);
            
            // Fetch Ubuntu font
            const fontBytes = await fetch(
                'https://github.com/Hopding/pdf-lib/raw/master/assets/fonts/ubuntu/Ubuntu-R.ttf'
            ).then(res => res.arrayBuffer());
            
            const font = await pdfDoc.embedFont(fontBytes);
            
            const page = pdfDoc.addPage();
            const { height, width } = page.getSize();
    
            let yOffset = height - 50;
            const fontSize = 12;
            const lineHeight = 20;
    
            // Add title
            page.drawText('Transkrypcja rozmowy', {
                x: 50,
                y: yOffset,
                size: 24,
                font: font,
                color: rgb(0, 0, 0)
            });
            yOffset -= 40;
    
            // Add timestamp
            const now = new Date().toLocaleString('pl-PL');
            page.drawText(`Utworzono: ${now}`, {
                x: 50,
                y: yOffset,
                size: 10,
                font: font,
                color: rgb(0.5, 0.5, 0.5)
            });
            yOffset -= 30;
    
            // Add summary section if exists
            if (dialogueData?.summary) {
                page.drawText('Podsumowanie:', {
                    x: 50,
                    y: yOffset,
                    size: 16,
                    font: font,
                    color: rgb(0, 0, 0)
                });
                yOffset -= 20;
    
                const summaryLines = this.wrapText(dialogueData.summary, width - 100, fontSize, font);
                for (const line of summaryLines) {
                    if (yOffset < 50) {
                        page = pdfDoc.addPage();
                        yOffset = height - 50;
                    }
                    page.drawText(line, {
                        x: 50,
                        y: yOffset,
                        size: fontSize,
                        font: font,
                        color: rgb(0, 0, 0)
                    });
                    yOffset -= lineHeight;
                }
                yOffset -= 30;
            }
    
            // Add dialogue section if exists
            if (dialogueData?.dialogue && Array.isArray(dialogueData.dialogue)) {
                page.drawText('Dialog:', {
                    x: 50,
                    y: yOffset,
                    size: 16,
                    font: font,
                    color: rgb(0, 0, 0)
                });
                yOffset -= 20;
    
                for (const entry of dialogueData.dialogue) {
                    if (yOffset < 50) {
                        page = pdfDoc.addPage();
                        yOffset = height - 50;
                    }
    
                    if (entry?.speaker) {
                        // Draw speaker name
                        page.drawText(`${entry.speaker}:`, {
                            x: 50,
                            y: yOffset,
                            size: fontSize,
                            font: font,
                            color: rgb(0, 0, 0.5)
                        });
                        yOffset -= lineHeight;
                    }
    
                    if (entry?.text) {
                        // Draw speech content
                        const textLines = this.wrapText(entry.text, width - 120, fontSize, font);
                        for (const line of textLines) {
                            if (yOffset < 50) {
                                page = pdfDoc.addPage();
                                yOffset = height - 50;
                            }
                            page.drawText(line, {
                                x: 70,
                                y: yOffset,
                                size: fontSize,
                                font: font,
                                color: rgb(0, 0, 0)
                            });
                            yOffset -= lineHeight;
                        }
                        yOffset -= 10; // Add extra space between speakers
                    }
                }
            }
    
            const pdfBytes = await pdfDoc.save();
            await fs.writeFile(outputPath, pdfBytes);
        } catch (error) {
            console.error('Error creating PDF:', error);
            throw error;
        }
    }

    wrapText(text, maxWidth, fontSize, font) {
        // Sprawdzenie czy text jest zdefiniowany
        if (!text) return [];
        
        const words = text.split(' ');
        const lines = [];
        let currentLine = '';
    
        for (const word of words) {
            const testLine = currentLine ? `${currentLine} ${word}` : word;
            const testWidth = font ? font.widthOfTextAtSize(testLine, fontSize) : testLine.length * (fontSize * 0.5);
    
            if (testWidth > maxWidth) {
                lines.push(currentLine);
                currentLine = word;
            } else {
                currentLine = testLine;
            }
        }
        if (currentLine) {
            lines.push(currentLine);
        }
    
        return lines;
    }
}

module.exports = VideoProcessor;