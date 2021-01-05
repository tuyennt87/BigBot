// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const path = require('path');

const dotenv = require('dotenv');
// Import required bot configuration.
const ENV_FILE = path.join(__dirname, '.env');
dotenv.config({ path: ENV_FILE });

const restify = require('restify');

// Import required bot services.
// See https://aka.ms/bot-services to learn more about the different parts of a bot.
const { BotFrameworkAdapter } = require('botbuilder');

// This bot's main dialog.
const { EchoBot } = require('./bot');

// Create HTTP server
const server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, () => {
    console.log(`\n${ server.name } listening to ${ server.url }`);
    console.log('\nGet Bot Framework Emulator: https://aka.ms/botframework-emulator');
    console.log('\nTo talk to your bot, open the emulator select "Open Bot"');
});

// Create adapter.
// See https://aka.ms/about-bot-adapter to learn more about how bots work.
const adapter = new BotFrameworkAdapter({
    appId: process.env.MicrosoftAppId,
    appPassword: process.env.MicrosoftAppPassword,
    channelService: process.env.ChannelService,
    openIdMetadata: process.env.BotOpenIdMetadata
});

// Catch-all for errors.
const onTurnErrorHandler = async (context, error) => {
    // This check writes out errors to console log .vs. app insights.
    // NOTE: In production environment, you should consider logging this to Azure
    //       application insights.
    console.error(`\n [onTurnError] unhandled error: ${ error }`);

    // Send a trace activity, which will be displayed in Bot Framework Emulator
    await context.sendTraceActivity(
        'OnTurnError Trace',
        `${ error }`,
        'https://www.botframework.com/schemas/error',
        'TurnError'
    );

    // Send a message to the user
    await context.sendActivity('The bot encountered an error or bug.');
    await context.sendActivity('To continue to run this bot, please fix the bot source code.');
};

// Set the onTurnError for the singleton BotFrameworkAdapter.
adapter.onTurnError = onTurnErrorHandler;

// Create the main dialog.
const myBot = new EchoBot();

// Listen for incoming requests.
server.post('/api/messages', (req, res) => {
    adapter.processActivity(req, res, async (context) => {
        // Route to main dialog.
        await myBot.run(context);
    });
});

// Listen for Upgrade requests for Streaming.
server.on('upgrade', (req, socket, head) => {
    // Create an adapter scoped to this WebSocket connection to allow storing session data.
    const streamingAdapter = new BotFrameworkAdapter({
        appId: process.env.MicrosoftAppId,
        appPassword: process.env.MicrosoftAppPassword
    });
    // Set onTurnError for the BotFrameworkAdapter created for each connection.
    streamingAdapter.onTurnError = onTurnErrorHandler;

    streamingAdapter.useWebSocket(req, socket, head, async (context) => {
        // After connecting via WebSocket, run this logic for every request sent over
        // the WebSocket connection.
        await myBot.run(context);
    });
});

// SIG // Begin signature block
// SIG // MIInOQYJKoZIhvcNAQcCoIInKjCCJyYCAQExDzANBglg
// SIG // hkgBZQMEAgEFADB3BgorBgEEAYI3AgEEoGkwZzAyBgor
// SIG // BgEEAYI3AgEeMCQCAQEEEBDgyQbOONQRoqMAEEvTUJAC
// SIG // AQACAQACAQACAQACAQAwMTANBglghkgBZQMEAgEFAAQg
// SIG // tcIN0SnlYU4WNSw0xazixGVcg74+1B1VRGmGEIt6dumg
// SIG // ghFpMIIIezCCB2OgAwIBAgITNgAAAQoPho466z+WJAAB
// SIG // AAABCjANBgkqhkiG9w0BAQsFADBBMRMwEQYKCZImiZPy
// SIG // LGQBGRYDR0JMMRMwEQYKCZImiZPyLGQBGRYDQU1FMRUw
// SIG // EwYDVQQDEwxBTUUgQ1MgQ0EgMDEwHhcNMjAwMjA5MTMy
// SIG // MzUyWhcNMjEwMjA4MTMyMzUyWjAkMSIwIAYDVQQDExlN
// SIG // aWNyb3NvZnQgQXp1cmUgQ29kZSBTaWduMIIBIjANBgkq
// SIG // hkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAmksYDtPDjCJA
// SIG // wYT+bRbc/za1SLbO4O/xggy6YQ9QuXm4+S8EWyZwwmQC
// SIG // W2CXDjg/PtR3/p2z9GvhOPA/PRWd/t1pc+CyntYvsvRI
// SIG // Qb4L0v+8ZPD4CeXncaccALGfkBGejMtPDN/SdHlbt4Sw
// SIG // hWJBL12YicfL1rcDPUIc6QveY14RW2ltSevfA85RyZqV
// SIG // zfL58dddyhxWBmAToCEnDisGUaakCqfKq1jC2I66nfGG
// SIG // rsvgJ8ENXcHPx16/iL2PEfOe+9dS698NFf3fqUsg57ZC
// SIG // xcoe8J726qdR+NPB/CwOdwsUfvg9adKkzEPbuf+wKtT4
// SIG // FASHRD7fvav5eF6mFCuCRwIDAQABo4IFhzCCBYMwKQYJ
// SIG // KwYBBAGCNxUKBBwwGjAMBgorBgEEAYI3WwEBMAoGCCsG
// SIG // AQUFBwMDMD0GCSsGAQQBgjcVBwQwMC4GJisGAQQBgjcV
// SIG // CIaQ4w2E1bR4hPGLPoWb3RbOnRKBYIPdzWaGlIwyAgFk
// SIG // AgEMMIICdgYIKwYBBQUHAQEEggJoMIICZDBiBggrBgEF
// SIG // BQcwAoZWaHR0cDovL2NybC5taWNyb3NvZnQuY29tL3Br
// SIG // aWluZnJhL0NlcnRzL0JZMlBLSUNTQ0EwMS5BTUUuR0JM
// SIG // X0FNRSUyMENTJTIwQ0ElMjAwMSgxKS5jcnQwUgYIKwYB
// SIG // BQUHMAKGRmh0dHA6Ly9jcmwxLmFtZS5nYmwvYWlhL0JZ
// SIG // MlBLSUNTQ0EwMS5BTUUuR0JMX0FNRSUyMENTJTIwQ0El
// SIG // MjAwMSgxKS5jcnQwUgYIKwYBBQUHMAKGRmh0dHA6Ly9j
// SIG // cmwyLmFtZS5nYmwvYWlhL0JZMlBLSUNTQ0EwMS5BTUUu
// SIG // R0JMX0FNRSUyMENTJTIwQ0ElMjAwMSgxKS5jcnQwUgYI
// SIG // KwYBBQUHMAKGRmh0dHA6Ly9jcmwzLmFtZS5nYmwvYWlh
// SIG // L0JZMlBLSUNTQ0EwMS5BTUUuR0JMX0FNRSUyMENTJTIw
// SIG // Q0ElMjAwMSgxKS5jcnQwUgYIKwYBBQUHMAKGRmh0dHA6
// SIG // Ly9jcmw0LmFtZS5nYmwvYWlhL0JZMlBLSUNTQ0EwMS5B
// SIG // TUUuR0JMX0FNRSUyMENTJTIwQ0ElMjAwMSgxKS5jcnQw
// SIG // ga0GCCsGAQUFBzAChoGgbGRhcDovLy9DTj1BTUUlMjBD
// SIG // UyUyMENBJTIwMDEsQ049QUlBLENOPVB1YmxpYyUyMEtl
// SIG // eSUyMFNlcnZpY2VzLENOPVNlcnZpY2VzLENOPUNvbmZp
// SIG // Z3VyYXRpb24sREM9QU1FLERDPUdCTD9jQUNlcnRpZmlj
// SIG // YXRlP2Jhc2U/b2JqZWN0Q2xhc3M9Y2VydGlmaWNhdGlv
// SIG // bkF1dGhvcml0eTAdBgNVHQ4EFgQUm4u2/aDP2bNDS/41
// SIG // o9okfYFEuyUwDgYDVR0PAQH/BAQDAgeAMFQGA1UdEQRN
// SIG // MEukSTBHMS0wKwYDVQQLEyRNaWNyb3NvZnQgSXJlbGFu
// SIG // ZCBPcGVyYXRpb25zIExpbWl0ZWQxFjAUBgNVBAUTDTIz
// SIG // NjE2Nys0NTc3OTAwggHUBgNVHR8EggHLMIIBxzCCAcOg
// SIG // ggG/oIIBu4Y8aHR0cDovL2NybC5taWNyb3NvZnQuY29t
// SIG // L3BraWluZnJhL0NSTC9BTUUlMjBDUyUyMENBJTIwMDEu
// SIG // Y3Jshi5odHRwOi8vY3JsMS5hbWUuZ2JsL2NybC9BTUUl
// SIG // MjBDUyUyMENBJTIwMDEuY3Jshi5odHRwOi8vY3JsMi5h
// SIG // bWUuZ2JsL2NybC9BTUUlMjBDUyUyMENBJTIwMDEuY3Js
// SIG // hi5odHRwOi8vY3JsMy5hbWUuZ2JsL2NybC9BTUUlMjBD
// SIG // UyUyMENBJTIwMDEuY3Jshi5odHRwOi8vY3JsNC5hbWUu
// SIG // Z2JsL2NybC9BTUUlMjBDUyUyMENBJTIwMDEuY3JshoG6
// SIG // bGRhcDovLy9DTj1BTUUlMjBDUyUyMENBJTIwMDEsQ049
// SIG // QlkyUEtJQ1NDQTAxLENOPUNEUCxDTj1QdWJsaWMlMjBL
// SIG // ZXklMjBTZXJ2aWNlcyxDTj1TZXJ2aWNlcyxDTj1Db25m
// SIG // aWd1cmF0aW9uLERDPUFNRSxEQz1HQkw/Y2VydGlmaWNh
// SIG // dGVSZXZvY2F0aW9uTGlzdD9iYXNlP29iamVjdENsYXNz
// SIG // PWNSTERpc3RyaWJ1dGlvblBvaW50MB8GA1UdIwQYMBaA
// SIG // FBtmohn8m+ul2oSPGJjpEKTDe5K9MB8GA1UdJQQYMBYG
// SIG // CisGAQQBgjdbAQEGCCsGAQUFBwMDMA0GCSqGSIb3DQEB
// SIG // CwUAA4IBAQB6CaQpdnylIZthgJx+fpLUNd0WQle+awqq
// SIG // uXwQpW4djrUqFoI43kR5F1JPWD/FrnEFke75R1wTNmaC
// SIG // Gkr7qCOC3i2W6+wqqddxANRNjkHuphOc15TiwGIcK1ug
// SIG // oS4A5Ijp0Zai65CnlLcy+xswbEnxEfg/12sHM4HfA9k+
// SIG // rHe2Lyfhqnyf2TOI/Gd4Czcmh2EUV/vG5DPmkBXYdOT4
// SIG // /F9M+qqUwW+oOD8ppZatlhz+4Z6KsEjXke4YOlTjvJPt
// SIG // cK+fWQxryrxz9XHYNmX2WbB4HdwYdWFuNsQZ7oB0ReOp
// SIG // J28cIBQgAq4lnuwDGOoTuNC9KHIzxZH9et8FotSwgSOA
// SIG // MIII5jCCBs6gAwIBAgITHwAAABS0xR/G8oC+cQAAAAAA
// SIG // FDANBgkqhkiG9w0BAQsFADA8MRMwEQYKCZImiZPyLGQB
// SIG // GRYDR0JMMRMwEQYKCZImiZPyLGQBGRYDQU1FMRAwDgYD
// SIG // VQQDEwdhbWVyb290MB4XDTE2MDkxNTIxMzMwM1oXDTIx
// SIG // MDkxNTIxNDMwM1owQTETMBEGCgmSJomT8ixkARkWA0dC
// SIG // TDETMBEGCgmSJomT8ixkARkWA0FNRTEVMBMGA1UEAxMM
// SIG // QU1FIENTIENBIDAxMIIBIjANBgkqhkiG9w0BAQEFAAOC
// SIG // AQ8AMIIBCgKCAQEA1VeBAtb5+tD3G4C53TfNJNxmYfzh
// SIG // iXKtKQzSGxuav660bTS1VEeDDjSnFhsmnlb6GkPCeYmC
// SIG // JwWgZGs+3oWJ8yad3//VoP99bXG8azzTJmT2PFM1yKxU
// SIG // XUJgi7I9y3C4ll/ATfBwbGGRXD+2PdkdlVpxKWzeNEPV
// SIG // wbCtxWjUhHr6Ecy9R6O23j+2/RSZSgfzYctDzDWhNf0P
// SIG // vGPflm31PSk4+ozca337/Ozu0+naDKg5i/zFHhfSJZkq
// SIG // 5dPPG6C8wDrdiwHh6G5IGrMd2QXnmvEfjtpPqE+G8MeW
// SIG // bszaWxlxEjQJQC6PBwn+8Qt4Vqlc0am3Z3fBw8kzRunO
// SIG // s8Mn/wIDAQABo4IE2jCCBNYwEAYJKwYBBAGCNxUBBAMC
// SIG // AQEwIwYJKwYBBAGCNxUCBBYEFJH8M85CnvaT5uJ9VNcI
// SIG // GLu413FlMB0GA1UdDgQWBBQbZqIZ/JvrpdqEjxiY6RCk
// SIG // w3uSvTCCAQQGA1UdJQSB/DCB+QYHKwYBBQIDBQYIKwYB
// SIG // BQUHAwEGCCsGAQUFBwMCBgorBgEEAYI3FAIBBgkrBgEE
// SIG // AYI3FQYGCisGAQQBgjcKAwwGCSsGAQQBgjcVBgYIKwYB
// SIG // BQUHAwkGCCsGAQUFCAICBgorBgEEAYI3QAEBBgsrBgEE
// SIG // AYI3CgMEAQYKKwYBBAGCNwoDBAYJKwYBBAGCNxUFBgor
// SIG // BgEEAYI3FAICBgorBgEEAYI3FAIDBggrBgEFBQcDAwYK
// SIG // KwYBBAGCN1sBAQYKKwYBBAGCN1sCAQYKKwYBBAGCN1sD
// SIG // AQYKKwYBBAGCN1sFAQYKKwYBBAGCN1sEAQYKKwYBBAGC
// SIG // N1sEAjAZBgkrBgEEAYI3FAIEDB4KAFMAdQBiAEMAQTAL
// SIG // BgNVHQ8EBAMCAYYwEgYDVR0TAQH/BAgwBgEB/wIBADAf
// SIG // BgNVHSMEGDAWgBQpXlFeZK40ueusnA2njHUB0QkLKDCC
// SIG // AWgGA1UdHwSCAV8wggFbMIIBV6CCAVOgggFPhiNodHRw
// SIG // Oi8vY3JsMS5hbWUuZ2JsL2NybC9hbWVyb290LmNybIYx
// SIG // aHR0cDovL2NybC5taWNyb3NvZnQuY29tL3BraWluZnJh
// SIG // L2NybC9hbWVyb290LmNybIYjaHR0cDovL2NybDIuYW1l
// SIG // LmdibC9jcmwvYW1lcm9vdC5jcmyGI2h0dHA6Ly9jcmwz
// SIG // LmFtZS5nYmwvY3JsL2FtZXJvb3QuY3JshoGqbGRhcDov
// SIG // Ly9DTj1hbWVyb290LENOPUFNRVJPT1QsQ049Q0RQLENO
// SIG // PVB1YmxpYyUyMEtleSUyMFNlcnZpY2VzLENOPVNlcnZp
// SIG // Y2VzLENOPUNvbmZpZ3VyYXRpb24sREM9QU1FLERDPUdC
// SIG // TD9jZXJ0aWZpY2F0ZVJldm9jYXRpb25MaXN0P2Jhc2U/
// SIG // b2JqZWN0Q2xhc3M9Y1JMRGlzdHJpYnV0aW9uUG9pbnQw
// SIG // ggGrBggrBgEFBQcBAQSCAZ0wggGZMDcGCCsGAQUFBzAC
// SIG // hitodHRwOi8vY3JsMS5hbWUuZ2JsL2FpYS9BTUVST09U
// SIG // X2FtZXJvb3QuY3J0MEcGCCsGAQUFBzAChjtodHRwOi8v
// SIG // Y3JsLm1pY3Jvc29mdC5jb20vcGtpaW5mcmEvY2VydHMv
// SIG // QU1FUk9PVF9hbWVyb290LmNydDA3BggrBgEFBQcwAoYr
// SIG // aHR0cDovL2NybDIuYW1lLmdibC9haWEvQU1FUk9PVF9h
// SIG // bWVyb290LmNydDA3BggrBgEFBQcwAoYraHR0cDovL2Ny
// SIG // bDMuYW1lLmdibC9haWEvQU1FUk9PVF9hbWVyb290LmNy
// SIG // dDCBogYIKwYBBQUHMAKGgZVsZGFwOi8vL0NOPWFtZXJv
// SIG // b3QsQ049QUlBLENOPVB1YmxpYyUyMEtleSUyMFNlcnZp
// SIG // Y2VzLENOPVNlcnZpY2VzLENOPUNvbmZpZ3VyYXRpb24s
// SIG // REM9QU1FLERDPUdCTD9jQUNlcnRpZmljYXRlP2Jhc2U/
// SIG // b2JqZWN0Q2xhc3M9Y2VydGlmaWNhdGlvbkF1dGhvcml0
// SIG // eTANBgkqhkiG9w0BAQsFAAOCAgEAKLdKhpqPH6QBaM3C
// SIG // AOqQi8oA4WQeZLW3QOXNmWm7UA018DQEa1yTqEQbuD5O
// SIG // lR1Wu/F289DmXNTdsZM4GTKEaZehIiVaMoLvEJtu5h6C
// SIG // TyfWqPetNyOJqR1sGqod0Xwn5/G/zcTYSxn5K3N8Kdlc
// SIG // DrZAIyfq3yaEJYHGnA9eJ/f1RrfbJgeo/RAhICctOONw
// SIG // fpsBXcgiTuTmlD/k0DqogvzJgPq9GOkIyX/dxk7IkPzX
// SIG // /n484s0zHR4IKU58U3G1oPSQmZ5OHAvgHaEASkdN5E20
// SIG // HyJv5zN7du+QY08fI+VIci6pagLfXHYaTX3ZJ/MUM9XU
// SIG // +oU5y4qMLzTj1JIG0LVfuHK8yoB7h2inyTe7bn6h2G8N
// SIG // xZ02aKZ0xa+n/JnoXKNsaVPG1SoTuItMsXV5pQtIShsB
// SIG // qnXqFjY3bJMlMhIofMcjiuOwRCW+prZ+PoYvE2P+ML7g
// SIG // s3L65GZ9BdKF3fSW3TvmpOujPQ23rzSle9WGxFJ02fNb
// SIG // aF9C7bG44uDzMoZU4P+uvQaB7KE4OMqAvYYfFy1tv1dp
// SIG // VIN/qhx0H/9oNiOJpuZZ39ZibLt9DXbsq5qwyHmdJXai
// SIG // sxwB53wJshUjc1i76xqFPUNGb8EZQ3aFKl2w9B47vfBi
// SIG // +nU3sN0tpnLPtew4LHWq4LBD5uiNZVBOYosZ6BKhSlk1
// SIG // +Y/0y1IxghUoMIIVJAIBATBYMEExEzARBgoJkiaJk/Is
// SIG // ZAEZFgNHQkwxEzARBgoJkiaJk/IsZAEZFgNBTUUxFTAT
// SIG // BgNVBAMTDEFNRSBDUyBDQSAwMQITNgAAAQoPho466z+W
// SIG // JAABAAABCjANBglghkgBZQMEAgEFAKCBrjAZBgkqhkiG
// SIG // 9w0BCQMxDAYKKwYBBAGCNwIBBDAcBgorBgEEAYI3AgEL
// SIG // MQ4wDAYKKwYBBAGCNwIBFTAvBgkqhkiG9w0BCQQxIgQg
// SIG // RnUTyL8urSa1k8c+8L3b71MOPTVasltA2/9KfwJbguMw
// SIG // QgYKKwYBBAGCNwIBDDE0MDKgFIASAE0AaQBjAHIAbwBz
// SIG // AG8AZgB0oRqAGGh0dHA6Ly93d3cubWljcm9zb2Z0LmNv
// SIG // bTANBgkqhkiG9w0BAQEFAASCAQBr6WenFfR7OUC8GeSU
// SIG // Qbbnks5sg6YVqQ4arvvv36tgFS4QbMfr+hy3gEO76oxy
// SIG // 9WNTecMoQUZmwrnJeOIsArbET+1Tcq1eXsqPndW0xFuh
// SIG // F8PVs7M5YL4ZR2S1fcr9iGC6D1dbO99afMvefXMVrPze
// SIG // zIbujJlvj3isJ1E5im+Uk9lpIQkPYkdSump6qjJeI0Wt
// SIG // bx8PJmJGTyHi4B+/laC97sH99K0GtkxwCMjOppCVHfXj
// SIG // kOfyaaykJ3RVdOfMSajYCzb6WL0z5cABAOp2VNZwhZTg
// SIG // ezNJXp6t83sc8fUlZf/N2y2J1d7IAl5X+VoGech9I8xy
// SIG // IAXcBuWudYwkXvaboYIS8DCCEuwGCisGAQQBgjcDAwEx
// SIG // ghLcMIIS2AYJKoZIhvcNAQcCoIISyTCCEsUCAQMxDzAN
// SIG // BglghkgBZQMEAgEFADCCAVQGCyqGSIb3DQEJEAEEoIIB
// SIG // QwSCAT8wggE7AgEBBgorBgEEAYRZCgMBMDEwDQYJYIZI
// SIG // AWUDBAIBBQAEIHZdewwi5CjyRIpMdISAxrbQHxBa2I5p
// SIG // 0bUaulbr481nAgZfiEOHx3cYEjIwMjAxMDI2MjIwMDM2
// SIG // Ljc3WjAEgAIB9KCB1KSB0TCBzjELMAkGA1UEBhMCVVMx
// SIG // EzARBgNVBAgTCldhc2hpbmd0b24xEDAOBgNVBAcTB1Jl
// SIG // ZG1vbmQxHjAcBgNVBAoTFU1pY3Jvc29mdCBDb3Jwb3Jh
// SIG // dGlvbjEpMCcGA1UECxMgTWljcm9zb2Z0IE9wZXJhdGlv
// SIG // bnMgUHVlcnRvIFJpY28xJjAkBgNVBAsTHVRoYWxlcyBU
// SIG // U1MgRVNOOjc4ODAtRTM5MC04MDE0MSUwIwYDVQQDExxN
// SIG // aWNyb3NvZnQgVGltZS1TdGFtcCBTZXJ2aWNloIIORDCC
// SIG // BPUwggPdoAMCAQICEzMAAAEooA6B4TbVT8IAAAAAASgw
// SIG // DQYJKoZIhvcNAQELBQAwfDELMAkGA1UEBhMCVVMxEzAR
// SIG // BgNVBAgTCldhc2hpbmd0b24xEDAOBgNVBAcTB1JlZG1v
// SIG // bmQxHjAcBgNVBAoTFU1pY3Jvc29mdCBDb3Jwb3JhdGlv
// SIG // bjEmMCQGA1UEAxMdTWljcm9zb2Z0IFRpbWUtU3RhbXAg
// SIG // UENBIDIwMTAwHhcNMTkxMjE5MDExNTAwWhcNMjEwMzE3
// SIG // MDExNTAwWjCBzjELMAkGA1UEBhMCVVMxEzARBgNVBAgT
// SIG // Cldhc2hpbmd0b24xEDAOBgNVBAcTB1JlZG1vbmQxHjAc
// SIG // BgNVBAoTFU1pY3Jvc29mdCBDb3Jwb3JhdGlvbjEpMCcG
// SIG // A1UECxMgTWljcm9zb2Z0IE9wZXJhdGlvbnMgUHVlcnRv
// SIG // IFJpY28xJjAkBgNVBAsTHVRoYWxlcyBUU1MgRVNOOjc4
// SIG // ODAtRTM5MC04MDE0MSUwIwYDVQQDExxNaWNyb3NvZnQg
// SIG // VGltZS1TdGFtcCBTZXJ2aWNlMIIBIjANBgkqhkiG9w0B
// SIG // AQEFAAOCAQ8AMIIBCgKCAQEAnZGx1vdU24Y+zb8OClz2
// SIG // C3vssbQk+QPhVZOUQkuSrOdMmX5Ghl+I7A3qJZ8+7iT+
// SIG // SPyfBjum8uzU6wHLj3jK6yDiscvAc1Qk+3DVNzngw4uB
// SIG // 1yiwDg3GSLvd8PKpbAO2M52TofuQ1zME+oAMPoH3yi3v
// SIG // v/BIAIEkjGb2oBS52q5Ll9zMIXT75pZRq8O7jpTdy/oc
// SIG // SMh1XZl0lNQqDhZQh1NgxBcjTzb6pKzjlYFmNwr3z+0h
// SIG // /Hy6ryrySxYX37NSMZMWIxooeGftxIKgSPsTW1WZbTwh
// SIG // KlLrvxYU/b4DQ5DBpZwko0AIr4n4trsvPZsa6kKJ04bP
// SIG // lcN7BzWUP2cs9wIDAQABo4IBGzCCARcwHQYDVR0OBBYE
// SIG // FITi8oPxfrU3m9QBw050f1AEy6byMB8GA1UdIwQYMBaA
// SIG // FNVjOlyKMZDzQ3t8RhvFM2hahW1VMFYGA1UdHwRPME0w
// SIG // S6BJoEeGRWh0dHA6Ly9jcmwubWljcm9zb2Z0LmNvbS9w
// SIG // a2kvY3JsL3Byb2R1Y3RzL01pY1RpbVN0YVBDQV8yMDEw
// SIG // LTA3LTAxLmNybDBaBggrBgEFBQcBAQROMEwwSgYIKwYB
// SIG // BQUHMAKGPmh0dHA6Ly93d3cubWljcm9zb2Z0LmNvbS9w
// SIG // a2kvY2VydHMvTWljVGltU3RhUENBXzIwMTAtMDctMDEu
// SIG // Y3J0MAwGA1UdEwEB/wQCMAAwEwYDVR0lBAwwCgYIKwYB
// SIG // BQUHAwgwDQYJKoZIhvcNAQELBQADggEBAItfZkcYhQuA
// SIG // OT+JxwdZTLCMPICwEeWGSa2YGniWV3Avd02jRtdlkeJJ
// SIG // kH5zYrO8+pjrgGUQKNL8+q6vab1RpPU3QF5SjBEdBPzz
// SIG // B3N33iBiopeYsNtVHzJ5WAGRw/8mJVZtd1DNzPURMeBa
// SIG // uH67MDwHBSABocnD6ddhxwi4OA8kzVRN42X1Hk69/7rN
// SIG // HYTlkjgOsiq9LiMfhCygw9OfbsCM3tVm3hqahHEwsRxA
// SIG // BLu89PUlRRpEWkUeaRRhWWfVgyzD///r3rxpG/LdyYKV
// SIG // Lji7GSRogtuGHWHT16NmMeGsSf6T0xxWRaK5jvbiMn/n
// SIG // u3KUzsD+PMhY2PUXxWWGTLIwggZxMIIEWaADAgECAgph
// SIG // CYEqAAAAAAACMA0GCSqGSIb3DQEBCwUAMIGIMQswCQYD
// SIG // VQQGEwJVUzETMBEGA1UECBMKV2FzaGluZ3RvbjEQMA4G
// SIG // A1UEBxMHUmVkbW9uZDEeMBwGA1UEChMVTWljcm9zb2Z0
// SIG // IENvcnBvcmF0aW9uMTIwMAYDVQQDEylNaWNyb3NvZnQg
// SIG // Um9vdCBDZXJ0aWZpY2F0ZSBBdXRob3JpdHkgMjAxMDAe
// SIG // Fw0xMDA3MDEyMTM2NTVaFw0yNTA3MDEyMTQ2NTVaMHwx
// SIG // CzAJBgNVBAYTAlVTMRMwEQYDVQQIEwpXYXNoaW5ndG9u
// SIG // MRAwDgYDVQQHEwdSZWRtb25kMR4wHAYDVQQKExVNaWNy
// SIG // b3NvZnQgQ29ycG9yYXRpb24xJjAkBgNVBAMTHU1pY3Jv
// SIG // c29mdCBUaW1lLVN0YW1wIFBDQSAyMDEwMIIBIjANBgkq
// SIG // hkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAqR0NvHcRijog
// SIG // 7PwTl/X6f2mUa3RUENWlCgCChfvtfGhLLF/Fw+Vhwna3
// SIG // PmYrW/AVUycEMR9BGxqVHc4JE458YTBZsTBED/FgiIRU
// SIG // QwzXTbg4CLNC3ZOs1nMwVyaCo0UN0Or1R4HNvyRgMlhg
// SIG // RvJYR4YyhB50YWeRX4FUsc+TTJLBxKZd0WETbijGGvmG
// SIG // gLvfYfxGwScdJGcSchohiq9LZIlQYrFd/XcfPfBXday9
// SIG // ikJNQFHRD5wGPmd/9WbAA5ZEfu/QS/1u5ZrKsajyeioK
// SIG // MfDaTgaRtogINeh4HLDpmc085y9Euqf03GS9pAHBIAmT
// SIG // eM38vMDJRF1eFpwBBU8iTQIDAQABo4IB5jCCAeIwEAYJ
// SIG // KwYBBAGCNxUBBAMCAQAwHQYDVR0OBBYEFNVjOlyKMZDz
// SIG // Q3t8RhvFM2hahW1VMBkGCSsGAQQBgjcUAgQMHgoAUwB1
// SIG // AGIAQwBBMAsGA1UdDwQEAwIBhjAPBgNVHRMBAf8EBTAD
// SIG // AQH/MB8GA1UdIwQYMBaAFNX2VsuP6KJcYmjRPZSQW9fO
// SIG // mhjEMFYGA1UdHwRPME0wS6BJoEeGRWh0dHA6Ly9jcmwu
// SIG // bWljcm9zb2Z0LmNvbS9wa2kvY3JsL3Byb2R1Y3RzL01p
// SIG // Y1Jvb0NlckF1dF8yMDEwLTA2LTIzLmNybDBaBggrBgEF
// SIG // BQcBAQROMEwwSgYIKwYBBQUHMAKGPmh0dHA6Ly93d3cu
// SIG // bWljcm9zb2Z0LmNvbS9wa2kvY2VydHMvTWljUm9vQ2Vy
// SIG // QXV0XzIwMTAtMDYtMjMuY3J0MIGgBgNVHSABAf8EgZUw
// SIG // gZIwgY8GCSsGAQQBgjcuAzCBgTA9BggrBgEFBQcCARYx
// SIG // aHR0cDovL3d3dy5taWNyb3NvZnQuY29tL1BLSS9kb2Nz
// SIG // L0NQUy9kZWZhdWx0Lmh0bTBABggrBgEFBQcCAjA0HjIg
// SIG // HQBMAGUAZwBhAGwAXwBQAG8AbABpAGMAeQBfAFMAdABh
// SIG // AHQAZQBtAGUAbgB0AC4gHTANBgkqhkiG9w0BAQsFAAOC
// SIG // AgEAB+aIUQ3ixuCYP4FxAz2do6Ehb7Prpsz1Mb7PBeKp
// SIG // /vpXbRkws8LFZslq3/Xn8Hi9x6ieJeP5vO1rVFcIK1GC
// SIG // RBL7uVOMzPRgEop2zEBAQZvcXBf/XPleFzWYJFZLdO9C
// SIG // EMivv3/Gf/I3fVo/HPKZeUqRUgCvOA8X9S95gWXZqbVr
// SIG // 5MfO9sp6AG9LMEQkIjzP7QOllo9ZKby2/QThcJ8ySif9
// SIG // Va8v/rbljjO7Yl+a21dA6fHOmWaQjP9qYn/dxUoLkSbi
// SIG // OewZSnFjnXshbcOco6I8+n99lmqQeKZt0uGc+R38ONiU
// SIG // 9MalCpaGpL2eGq4EQoO4tYCbIjggtSXlZOz39L9+Y1kl
// SIG // D3ouOVd2onGqBooPiRa6YacRy5rYDkeagMXQzafQ732D
// SIG // 8OE7cQnfXXSYIghh2rBQHm+98eEA3+cxB6STOvdlR3jo
// SIG // +KhIq/fecn5ha293qYHLpwmsObvsxsvYgrRyzR30uIUB
// SIG // HoD7G4kqVDmyW9rIDVWZeodzOwjmmC3qjeAzLhIp9cAv
// SIG // VCch98isTtoouLGp25ayp0Kiyc8ZQU3ghvkqmqMRZjDT
// SIG // u3QyS99je/WZii8bxyGvWbWu3EQ8l1Bx16HSxVXjad5X
// SIG // wdHeMMD9zOZN+w2/XU/pnR4ZOC+8z1gFLu8NoFA12u8J
// SIG // JxzVs341Hgi62jbb01+P3nSISRKhggLSMIICOwIBATCB
// SIG // /KGB1KSB0TCBzjELMAkGA1UEBhMCVVMxEzARBgNVBAgT
// SIG // Cldhc2hpbmd0b24xEDAOBgNVBAcTB1JlZG1vbmQxHjAc
// SIG // BgNVBAoTFU1pY3Jvc29mdCBDb3Jwb3JhdGlvbjEpMCcG
// SIG // A1UECxMgTWljcm9zb2Z0IE9wZXJhdGlvbnMgUHVlcnRv
// SIG // IFJpY28xJjAkBgNVBAsTHVRoYWxlcyBUU1MgRVNOOjc4
// SIG // ODAtRTM5MC04MDE0MSUwIwYDVQQDExxNaWNyb3NvZnQg
// SIG // VGltZS1TdGFtcCBTZXJ2aWNloiMKAQEwBwYFKw4DAhoD
// SIG // FQAxPUsb8oASPReyIv2fubGZfVp9m6CBgzCBgKR+MHwx
// SIG // CzAJBgNVBAYTAlVTMRMwEQYDVQQIEwpXYXNoaW5ndG9u
// SIG // MRAwDgYDVQQHEwdSZWRtb25kMR4wHAYDVQQKExVNaWNy
// SIG // b3NvZnQgQ29ycG9yYXRpb24xJjAkBgNVBAMTHU1pY3Jv
// SIG // c29mdCBUaW1lLVN0YW1wIFBDQSAyMDEwMA0GCSqGSIb3
// SIG // DQEBBQUAAgUA40FB6jAiGA8yMDIwMTAyNjE2MzkwNloY
// SIG // DzIwMjAxMDI3MTYzOTA2WjB3MD0GCisGAQQBhFkKBAEx
// SIG // LzAtMAoCBQDjQUHqAgEAMAoCAQACAh2PAgH/MAcCAQAC
// SIG // AhGGMAoCBQDjQpNqAgEAMDYGCisGAQQBhFkKBAIxKDAm
// SIG // MAwGCisGAQQBhFkKAwKgCjAIAgEAAgMHoSChCjAIAgEA
// SIG // AgMBhqAwDQYJKoZIhvcNAQEFBQADgYEAUy1Q0DUeZAQN
// SIG // oWPUL8g9aQApaTzm+yeZEjAAGsLHhR8pjlul3kziUj0L
// SIG // gfy6ur+ON1wXfVGiZsb78LrjsCatShfl4/b6ygugJ1+D
// SIG // HIGzyglIXy5b01JJ99+9p9cA715stg1rlSl+DP2LOrb/
// SIG // 6Em7qBptJ9jubcadgJ+nbKeteoYxggMNMIIDCQIBATCB
// SIG // kzB8MQswCQYDVQQGEwJVUzETMBEGA1UECBMKV2FzaGlu
// SIG // Z3RvbjEQMA4GA1UEBxMHUmVkbW9uZDEeMBwGA1UEChMV
// SIG // TWljcm9zb2Z0IENvcnBvcmF0aW9uMSYwJAYDVQQDEx1N
// SIG // aWNyb3NvZnQgVGltZS1TdGFtcCBQQ0EgMjAxMAITMwAA
// SIG // ASigDoHhNtVPwgAAAAABKDANBglghkgBZQMEAgEFAKCC
// SIG // AUowGgYJKoZIhvcNAQkDMQ0GCyqGSIb3DQEJEAEEMC8G
// SIG // CSqGSIb3DQEJBDEiBCCuJ4FQedocMGkDCSn8CItH/fAq
// SIG // QhfHIo9CHFG4j0qA/DCB+gYLKoZIhvcNAQkQAi8xgeow
// SIG // gecwgeQwgb0EILxFaouvBVJ379wbEN8GpLhvW09eGg8W
// SIG // sLrXm9XW6BTaMIGYMIGApH4wfDELMAkGA1UEBhMCVVMx
// SIG // EzARBgNVBAgTCldhc2hpbmd0b24xEDAOBgNVBAcTB1Jl
// SIG // ZG1vbmQxHjAcBgNVBAoTFU1pY3Jvc29mdCBDb3Jwb3Jh
// SIG // dGlvbjEmMCQGA1UEAxMdTWljcm9zb2Z0IFRpbWUtU3Rh
// SIG // bXAgUENBIDIwMTACEzMAAAEooA6B4TbVT8IAAAAAASgw
// SIG // IgQgeIWtzJn1Xz7hfSRyNeeDlwiCRX3YLFwAweOaagns
// SIG // QOgwDQYJKoZIhvcNAQELBQAEggEAU/xwtrfHfVf9c7c2
// SIG // ZHBqXsNYD/SFXQhYUKr912soQjbqQ88SUczsrnApd0i1
// SIG // l0NfLZsh3on5MyXuE0ii6NZAG3EL9/5qOBka9cN6D+tI
// SIG // +yoh1OD4V37EzLg6fO5wo7XmqtxphY7wvJVYD2WtBszd
// SIG // qZutMNBPKt3X3YdKl92Vey8ExLcQyqbO8Ld6mgEDR0mP
// SIG // i03sGO+T7GhlBCknS6zgiRmnTqWBkEEn/DhkDnYts4+6
// SIG // rf5DXSlfcwiRlSbBEjUihYlYFjneN9phU8PuAVDzVXL6
// SIG // lwOu3Q2KvWk+OCJLy1S+jG4YQqDdyGekCZBZfY8Zplub
// SIG // YOtSY2COgj9pYrS42g==
// SIG // End signature block
