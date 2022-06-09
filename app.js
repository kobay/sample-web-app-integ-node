const express = require("express");
const BoxSDK = require("box-node-sdk");
const port = process.env.PORT || 3000;
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// リクエストの情報をプリント
app.use((req, res, next) => {
  console.log("req.method", req.method);
  console.log("req.path", req.path);
  console.log("req.headers", JSON.stringify(req.headers, null, 2));
  console.log("req.body", JSON.stringify(req.body, null, 2));
  console.log("req.query", JSON.stringify(req.query, null, 2));
  next(); // 次の処理へ
});

app.get("/", async (req, res) => {
  let log = "";
  try {
    const { clientId, clientSecret, redirect, code, fileId } = req.query;
    console.log(`clientId`, clientId);
    console.log(`clientSecret`, clientSecret);
    console.log(`redirect`, redirect);
    console.log(`code`, code);
    console.log(`fileId`, fileId);

    log += `clientId = ${clientId}\n\n`;
    log += `clientSecret = ${clientSecret}\n\n`;
    log += `redirect = ${redirect}\n\n`;
    log += `code = ${code}\n\n`;
    log += `fileId = ${fileId}\n\n`;

    const sdk = new BoxSDK({
      clientID: clientId,
      clientSecret: clientSecret,
    });

    const tokenInfo = await sdk.getTokensAuthorizationCodeGrant(code);
    const client = sdk.getPersistentClient(tokenInfo);

    // ユーザー情報
    const me = await client.users.get(client.CURRENT_USER_ID);

    console.log(JSON.stringify(me));
    log += `user = ${JSON.stringify(me)}\n\n`;

    const now = Date.now();
    const file = await client.files.update(fileId, {
      name: now,
      tags: [`T${now}`],
    });

    console.log(JSON.stringify(file));
    log += `file = ${JSON.stringify(file)}\n\n`;
  } catch (e) {
    console.error(e);
    log += "\n\n##### Exception #####\n\n";
    log += e.message + "\n";
    log += e.stack;
  }
  res.send(log);
});

app.listen(port, () => {
  console.log(`express started on port ${port}`);
});
