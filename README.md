# RecNoApp

## Opis projektu
Aplikacja **Automated Meeting Notes Generator** to narzędzie webowe, które automatyzuje tworzenie notatek ze zdalnych spotkań. Umożliwia transkrypcję rozmów, zapis slajdów i treści z wirtualnych tablic, a następnie wysyła podsumowanie spotkania na podany adres e-mail.

## Funkcjonalności
- **Obsługiwane platformy wideokonferencyjne**: Teams, Zoom, Google Meet.
- **Dane wejściowe**: 
  - Nagrania wideo i audio.
  - Udostępnione slajdy i treści z tablic.
- **Dane wyjściowe**:
  - Transkrypcje rozmów.
  - Zrzuty ekranu prezentacji.
  - OCR treści na wirtualnych tablicach.
  - Podsumowanie w formie notatki przesłanej e-mailem.
- **Proces działania**:
  1. Przechwycenie danych audio i wideo podczas spotkania.
  2. Analiza danych po zakończeniu spotkania.
  3. Generowanie automatycznych notatek i wysyłanie na e-mail.

## Wymagania techniczne
- **Połączenie internetowe**: Aplikacja działa tylko online.
- **E-mail uczestnika**: Wymagany po zakończeniu spotkania (brak uwierzytelniania użytkownika).

## Technologie
1. **Frontend**: React z Tailwind CSS
   - Dynamiczne i nowoczesne budowanie interfejsu użytkownika.
   - Stylowanie w podejściu utility-first dla szybkiego tworzenia wizualnie spójnych aplikacji.
2. **Backend**: Node.js
   - Szybkie i skalowalne przetwarzanie danych w czasie rzeczywistym.
   - Łatwa integracja z bibliotekami do przetwarzania audio i OCR.
3. **Konteneryzacja**: Docker
   - Przenośność i spójne środowisko uruchomieniowe.
   - Wsparcie dla backendu, frontendu oraz usług pomocniczych.

## Architektura systemu
System składa się z:
- Modułu frontendu (React + Tailwind CSS).
- Modułu backendu (Node.js) odpowiedzialnego za przetwarzanie danych.
- Dockerowych kontenerów, które zapewniają niezależność środowisk.

## Diagramy UML
Pełna dokumentacja techniczna zawiera:
- Diagram przypadków użycia.
- Diagram sekwencyjny opisujący przepływ danych w aplikacji.

## Jak uruchomić projekt?
1. **Wymagania wstępne**:
   - Zainstalowany Docker.
   - Przeglądarka internetowa.
2. **Uruchomienie aplikacji**:
   - Sklonuj repozytorium: 
     ```bash
     git clone <repozytorium>
     ```
   - Uruchom Docker Compose:
     ```bash
     docker-compose up
     ```
   - Otwórz aplikację w przeglądarce: `http://localhost:3000`.

## Członkowie zespołu
- **Aleksy Dąda**
- **Szymon Domagała**
- **Piotr Stasiak**
