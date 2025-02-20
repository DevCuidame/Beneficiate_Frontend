ng generate component modules/auth/pages/register 
ng generate component modules/auth/pages/login 
ng generate component modules/auth/pages/reset-password 
ng generate component modules/home/pages/appointment-booking
ng generate component modules/home/pages/chat
ng generate component pages/pages

ng generate component shared/components/beneficiary-card
ng generate component shared/components/primary-card
ng generate component shared/components/secondary-card
ng generate component shared/components/appointment-card
ng generate component shared/components/health-professional-card
ng generate component shared/components/message

ng generate component modules/beneficiary/add-beneficiary
ng generate component modules/beneficiary/home-beneficiary

ng generate module modules/beneficiary


ng generate component modules/beneficiary/components/conditions_list
ng generate component modules/beneficiary/components/medicaments_allergies_list
ng generate component modules/beneficiary/components/medical_history_list
ng generate component modules/beneficiary/components/vacinations_list

ng generate component modules/beneficiary/components/health-condition-form
ng generate component modules/beneficiary/components/medicaments_allergies-form
ng generate component modules/beneficiary/components/medical_history-form
ng generate component modules/beneficiary/components/vacinations-form

/mi-proyecto-ionic  
│── e2e/                   # Pruebas end-to-end  
│── src/  
│   ├── app/               # Código principal de la aplicación  
│   │   ├── core/          # Módulos, servicios y configuraciones centrales  
│   │   │   ├── guards/    # Guards para rutas  
│   │   │   ├── interceptors/ # Interceptores HTTP  
│   │   │   ├── services/  # Servicios compartidos  
│   │   │   ├── utils/     # Utilidades y helpers  
│   │   │   ├── core.module.ts  
│   │   ├── shared/        # Componentes, directivas y pipes reutilizables  
│   │   │   ├── components/  
│   │   │   ├── directives/  
│   │   │   ├── pipes/  
│   │   │   ├── shared.module.ts  
│   │   ├── modules/       # Módulos funcionales  
│   │   │   ├── auth/      # Autenticación  
│   │   │   │   ├── pages/  
│   │   │   │   ├── services/  
│   │   │   │   ├── auth.module.ts  
│   │   │   ├── home/  
│   │   │   │   ├── pages/  
│   │   │   │   ├── home.module.ts  
│   │   ├── pages/         # Páginas principales de la aplicación  
│   │   │   ├── home/  
│   │   │   │   ├── home.page.ts  
│   │   │   │   ├── home.page.html  
│   │   │   │   ├── home.page.scss  
│   │   │   ├── login/  
│   │   │   ├── settings/  
│   │   ├── app-routing.module.ts  
│   │   ├── app.component.ts  
│   │   ├── app.module.ts  
│   ├── assets/            # Archivos estáticos  
│   ├── environments/      # Configuración de entornos  
│   │   ├── environment.ts  
│   │   ├── environment.prod.ts  
│── config.xml             # Configuración de Ionic  
│── angular.json           # Configuración de Angular  
│── capacitor.config.ts    # Configuración de Capacitor (si se usa Capacitor)  
│── package.json           # Dependencias del proyecto  
│── tsconfig.json          # Configuración de TypeScript  
│── tslint.json            # Reglas de linting  
│── ionic.config.json      # Configuración de Ionic  
