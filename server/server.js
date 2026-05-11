const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;
const IS_PROD = process.env.NODE_ENV === 'production';

app.use(express.static(path.join(__dirname, '../src')));

app.get('/api/config', async (req, res) => {
  if (IS_PROD) {
    const { SSMClient, GetParametersByPathCommand } = require('@aws-sdk/client-ssm');
    const client = new SSMClient({ region: process.env.AWS_REGION || 'ap-southeast-1' });
    const prefix = process.env.SSM_PREFIX || '/nyp-demo';

    const result = await client.send(new GetParametersByPathCommand({ Path: prefix, Recursive: false }));
    const config = {};
    for (const param of result.Parameters) {
      const key = param.Name.replace(`${prefix}/`, '');
      config[key] = param.Value;
    }
    return res.json(config);
  }

  // Local dev: read from config/app-config.json
  const configPath = path.join(__dirname, '../config/app-config.json');
  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  res.json(config);
});

app.listen(PORT, () => {
  console.log(`Running in ${IS_PROD ? 'production (SSM)' : 'local (config file)'} mode`);
  console.log(`http://localhost:${PORT}`);
});
