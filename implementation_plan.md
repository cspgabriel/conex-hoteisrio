# Project Adaptation: Assessoria Jurídica HotéisRIO

Adapt the existing "Dashboard-Demandas-Ordem-Publica" project for a new purpose: Legal Advisory (Assessoria Jurídica) for HotéisRIO.

## Proposed Changes

### Project Structure
- Copy all relevant files from `Dashboard-Demandas-Ordem-Publica` to `Assessoria Juridica HotéisRIO`.
- Update [package.json](file:///c:/Users/marke/OneDrive/Github/Demandas%20Ordem%20Pubilca/Dashboard-Demandas-Ordem-Publica/package.json) with the new project name.

### Firebase Decoupling
#### [MODIFY] [firebase.ts](file:///c:/Users/marke/OneDrive/Github/Assessoria%20Juridica/Assessoria%20Juridica%20Hot%C3%A9isRIO/services/firebase.ts)
- Comment out or mock the Firebase initialization to prevent connection errors.
- Ensure the app doesn't crash on startup due to missing Firebase config.

#### [MODIFY] [demandService.ts](file:///c:/Users/marke/OneDrive/Github/Assessoria%20Juridica/Assessoria%20Juridica%20Hot%C3%A9isRIO/services/demandService.ts)
- Replace Firestore calls with `localStorage` or simple console logging for the time being.
- Maintain the interface so the UI doesn't need mass refactoring.

### UI and Form Updates
#### [MODIFY] [PublicDemandForm.tsx](file:///c:/Users/marke/OneDrive/Github/Assessoria%20Juridica/Assessoria%20Juridica%20Hot%C3%A9isRIO/components/PublicDemandForm.tsx)
- Update form fields to match the user request:
    - **Nome do hotel**
    - **Responsavel pelo Preenchimento**
    - **Cargo**
    - **Email**
    - **WhatsApp** (+55)
    - **Assunto**: Direito Civil, Direito Tributário, Trabalhista.
    - **Descrição**: Breve descrição da solicitação.
- Update branding and labels (Logo, Titles).
- Remove geolocation/neighborhood logic as it's not requested for this version.

#### [MODIFY] [App.tsx](file:///c:/Users/marke/OneDrive/Github/Assessoria%20Juridica/Assessoria%20Juridica%20Hot%C3%A9isRIO/App.tsx)
- Update routes and main navigation if necessary.
- Update page titles.

## Verification Plan

### Automated Tests
- Run `npm run build` to ensure no TypeScript or build errors after removal of Firebase logic.

### Manual Verification
- Open the application in the browser.
- Fill out the form in [PublicDemandForm](file:///c:/Users/marke/OneDrive/Github/Demandas%20Ordem%20Pubilca/Dashboard-Demandas-Ordem-Publica/components/PublicDemandForm.tsx#17-483).
- Verify that clicking "Enviar" shows a success message (even if it just mocks the save).
- Check the console to see if the data would have been sent correctly.
