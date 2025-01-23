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
   - Łatwa integracja z bibliotekami do przetwarzania audio.


## Architektura systemu
System składa się z:
- Modułu frontendu (React + Tailwind CSS).
- Modułu backendu (Node.js) odpowiedzialnego za przetwarzanie danych.

## Diagramy UML
Pełna dokumentacja techniczna zawiera:
- Diagram przypadków użycia.
- Diagram sekwencyjny opisujący przepływ danych w aplikacji.

## Jak uruchomić projekt?
1. **Wymagania wstępne**:
   - Zainstalowany Node.js.
   - Przeglądarka internetowa.
   - Środowisko do uruchomienia aplikacji (np. Visual Studio Code)
2. **Uruchomienie aplikacji**:
   - Sklonuj repozytorium: 
     ```bash
     git clone <repozytorium>
     ```
   - Otwórz aplikacje w VScode i przejdź do folderu backendu i uruchom serwer node:
     ```bash
     cd /backend
     ```
        ```bash
     node server.js
     ```

    - Następnie wróc do folderu głównego i przejdź do katalogu frontendu i uruchom aplikacje:
        ```bash
        cd.. 
        ```
        ```bash
        cd /frontend
        ```
        ```bash
        npm run dev
        ```
   - Otwórz aplikację w przeglądarce: `http://localhost:5173` bądź inny adres podany w konsoli jeśli powyższy jest zajęty.

## Członkowie zespołu
- **Aleksy Dąda**
- **Szymon Domagała**
- **Piotr Stasiak**
