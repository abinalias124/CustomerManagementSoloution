import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';

import { App } from './app/app';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

import { Chart, registerables } from 'chart.js';

Chart.register(...registerables); //  Register all charts
bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));
 