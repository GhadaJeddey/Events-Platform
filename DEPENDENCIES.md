# Dépendances du Projet Events Platform

---

## BACKEND (NestJS)

### Runtime
- Node.js: v18+ ou v20+
- npm: 10.x ou supérieur

### Framework Principal
- @nestjs/common: ^11.0.1
- @nestjs/core: ^11.0.1
- @nestjs/platform-express: ^11.1.12

### Configuration et Validation
- @nestjs/config: ^4.0.2
- class-validator: ^0.14.3
- class-transformer: ^0.5.1

### Documentation (API)
- @nestjs/swagger: ^11.0.3 (Accessible sur /api)

### Base de Données (Cloud)
- @nestjs/typeorm: ^11.0.0
- typeorm: ^0.3.28
- pg: ^8.17.1 (Driver PostgreSQL pour Supabase)

### Utilitaires
- @nestjs/mapped-types: ^2.1.0
- rxjs: ^7.8.1
- reflect-metadata: ^0.2.2
- multer: ^2.0.2

### Outils de Développement
- @nestjs/cli: ^11.0.0
- typescript: ^5.7.3
- ts-node: ^10.9.2
- jest: ^30.0.0
- prettier: ^3.4.2
- eslint: ^9.18.0

---

## FRONTEND (Angular)

### Framework Principal
- @angular/core: ^21.0.0
- @angular/common: ^21.0.0
- @angular/compiler: ^21.0.0
- @angular/platform-browser: ^21.0.0

### Modules Angular
- @angular/forms: ^21.0.0
- @angular/router: ^21.0.0

### UI et Styles
- bootstrap: ^5.3.8

### Utilitaires
- rxjs: ~7.8.0
- tslib: ^2.3.0

### Outils de Développement
- @angular/cli: ^21.0.4
- @angular/build: ^21.0.4
- typescript: ~5.9.2
- vitest: ^4.0.8

---

## Installation et Démarrage

### Installation Rapide
```bash
# Dans la racine du projet
cd backend && npm install
cd ../frontend && npm install
```

### Lancer le projet
```bash
# Terminal 1 (Backend)
cd backend
npm run start:dev

# Terminal 2 (Frontend)
cd frontend
npm start
```

---

## Notes Techniques

- **Angular**: Version 21 (Signals et Control Flow)
- **Base de données**: Supabase (PostgreSQL)
- **API Documentation**: Swagger généré automatiquement
- **Image Handling**: Multer (Stockage local /uploads/events)

---

Dernière mise à jour: 17 janvier 2026
