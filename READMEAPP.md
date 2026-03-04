Remove-Item -Recurse -Force node_modules
npm install --legacy-peer-deps
npx expo start --clear --offline

--Build
npx expo export --platform web

Connect your project to Expo:
Run the following command connect your project to Expo. This allows you to use our services:
npx eas-cli@latest init --id 0cac1a9f-ea98-4a90-bda4-3b42054ca32b

Build and submit to the app stores:
Run the following command to create Android and iOS builds, then submit them to the app stores.
npx eas-cli@latest build --platform all --auto-submit
