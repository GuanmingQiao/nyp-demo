const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;
const IS_PROD = process.env.NODE_ENV === 'production';

app.use(express.static(path.join(__dirname, '../src')));

const CONFIG_DEFAULTS = {
  announcement: '',
  currentWeek: '1',
  semester: '',
  environment: 'production',
  deployedAt: '',
  commitSha: '',
};

app.get('/api/config', async (req, res) => {
  if (IS_PROD) {
    try {
      const { SSMClient, GetParametersByPathCommand } = require('@aws-sdk/client-ssm');
      const client = new SSMClient({ region: process.env.AWS_REGION || 'ap-southeast-1' });
      const prefix = process.env.SSM_PREFIX || '/nyp-demo';

      const result = await client.send(new GetParametersByPathCommand({ Path: prefix, Recursive: false }));
      const config = { ...CONFIG_DEFAULTS };
      for (const param of result.Parameters) {
        const key = param.Name.replace(`${prefix}/`, '');
        config[key] = param.Value;
      }
      return res.json(config);
    } catch (err) {
      console.error('SSM fetch failed:', err.message);
      return res.json({ ...CONFIG_DEFAULTS, _error: err.message });
    }
  }

  // Local dev: read from config/app-config.json
  const configPath = path.join(__dirname, '../config/app-config.json');
  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  res.json(config);
});

const S3_BUCKET   = process.env.S3_BUCKET || 'nyp-demo-labs-459471000310';
const S3_REGION   = process.env.AWS_REGION || 'ap-southeast-1';

app.get('/api/labs/:id/handout', async (req, res) => {
  try {
    const { S3Client, GetObjectCommand } = require('@aws-sdk/client-s3');
    const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
    const client  = new S3Client({ region: S3_REGION });
    const key     = `labs/lab-${req.params.id}.pdf`;
    const command = new GetObjectCommand({
      Bucket: S3_BUCKET,
      Key: key,
      ResponseContentDisposition: `attachment; filename="lab-${req.params.id}.pdf"`,
    });
    const url = await getSignedUrl(client, command, { expiresIn: 300 });
    res.redirect(url);
  } catch (err) {
    console.error('S3 presign failed:', err.message);
    res.status(404).json({ error: 'Handout not available' });
  }
});

app.listen(PORT, () => {
  console.log(`Running in ${IS_PROD ? 'production (SSM)' : 'local (config file)'} mode`);
  console.log(`http://localhost:${PORT}`);
});
