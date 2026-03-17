import { init } from '@instantdb/react';
import schema from '../../instant.schema';

const APP_ID = '4ee57541-45a0-4be1-a339-aadde2be9304';

export const db = init({
  appId: APP_ID,
  schema,
});

