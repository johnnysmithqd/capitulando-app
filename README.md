# Capitulando

App Android em React Native (Expo).

## Rodar localmente (Windows)

```powershell
cd C:\Users\johnn\Documents
git clone https://github.com/johnnysmithqd/capitulando-app.git
cd capitulando-app
git checkout claude/capitulando-android-app-ha62nn
npm install
npx expo install --fix   # alinha as versões com o SDK do Expo
npx expo start           # abra no celular com o app Expo Go
```

## Gerar APK / AAB (EAS Build, na nuvem)

```powershell
npm install -g eas-cli
eas login
npm run build:apk   # APK para instalar direto no celular
npm run build:aab   # AAB para a Google Play
```
