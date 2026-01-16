# Dépendances du Projet Events Platform

---

## BACKEND (NestJS)

### Runtime
- Node.js: v18+ ou v20+
- npm: 11.7.0

### Framework Principal
- @nestjs/common: ^11.0.1
- @nestjs/core: ^11.0.1
- @nestjs/platform-express: ^11.0.1

### Configuration et Validation
- @nestjs/config: ^4.0.2
- class-validator: ^0.14.3
- class-transformer: ^0.5.1

### Base de Données
- @nestjs/typeorm: ^11.0.0
- typeorm: ^0.3.28
- mysql2: ^3.16.0

### Utilitaires
- @nestjs/mapped-types: ^2.1.0
- rxjs: ^7.8.1
- reflect-metadata: ^0.2.2

### Outils de Développement
- @nestjs/cli: ^11.0.0
- typescript: ^5.7.3
- ts-node: ^10.9.2
- jest: ^30.0.0
- prettier: ^3.4.2
- eslint: ^9.18.0

---

## FRONTEND (Angular)

### Runtime
- Node.js: v18+ ou v20+
- npm: 11.7.0

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

## Installation

### Backend
```bash
cd backend
npm install
```

### Frontend
```bash
cd frontend
npm install
```

---

## Démarrage

### Backend
```bash
cd backend
npm run start        # Mode production
npm run start:dev    # Mode développement
```

### Frontend
```bash
cd frontend
npm start            # http://localhost:4200
```

---

## Mise à jour

```bash
npm outdated                      # Vérifier les versions
npm install <package>@latest      # Mettre à jour un package
npm update                        # Mettre à jour tous les packages
```

---

## Notes

- Angular: 21.0.0
- NestJS: 11.0.1
- TypeScript Backend: 5.7.3
- TypeScript Frontend: 5.9.2
- MySQL: 8.x
- Bootstrap: 5.3.8

---

Dernière mise à jour: 16 janvier 2026
