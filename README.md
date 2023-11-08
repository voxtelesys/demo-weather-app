## Overview
This project serves as a demo IVR controller that integrates into the [Voxtelesys Voice API](https://voiceapi.voxtelesys.com/).

### Weather Demo
This IVR provides the weather in realtime, or tomorrow's forecasted weather. The purpose is to demonstrate a dynamic IVR with voice features like ASR and TTS.

**Route Prefix:**<br>
`/weather-demo`

**Routes:**<br>
| Route             | Description                                                                                                                  |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `/entrypoint`     | Entrypoint for IVR. Responds with math-based CAPTCHA using ASR or DTMF input from user.                                      |
| `/captcha-answer` | Checks answer from CAPTCHA. If valid, redirects to `main`. Otherwise, the call ends.                                         |
| `/main`           | Captcha protected main menu for weather app. Using ASR, prompts user if they want the current weather of tomorrow's weather. |
| `/main-answer`    | Checks answer from main menu. Redirects to `/forecast` or `realtime` after promping user for their zipcode.                  |
| `/forecast`       | Looks up tomorrow's weather from tomorrow.io API.                                                                            |
| `/realtime`       | Looks up current weather from tomorrow.io API.                                                                               |
| `/zipcode-answer` | Validates the zipcode response from user. Redirects to `forecast` or `realtime`.                                             |
| `/sms-answer`     | Checks if user wants to receive SMS and send the message, if applicable.                                                     |


**Flow:**<br>
1. **Captcha:**
    - Hello, please verify that you are a human by entering or saying the answer to this simple question. What is __ + __ ?
    - *Incorrect:* hangup the call

2. **Main Menu:**
     - Welcome to the demo weather app. I can help you lookup real time weather or lookup the weather forecast for tomorrow. Which are you interested in?

    i. **Realtime Menu:**
      - Please say or enter your zip code and I will lookup the current weather.
      - *API request*
      - The current weather in __ is ${weatherCode}. The temperature is __ F with winds of __ MPH.

    ii. **Forecast Menu:**
      - Please say or enter your zip code and I will lookup the forecast for tomorrow.
      - *API request*
      - Tomorrow’s weather in __ will be ${weatherCode}. The temperature will be __ F with winds of __ MPH.

3. **SMS Menu:**
    - Would you like me to text you with the details from the weather report?
    - *API request*

### Dependencies
This application relies on two external APIs:
1. Weather API, using [tomorrow.io](https://www.tomorrow.io). You can setup a free account. Once setup, populate the `TOMORROW_TOKEN` ENV.
2. SMS API, using [Voxtelesys](https://portal.voxtelesys.net). Once setup, populate the `SMS_TOKEN` ENV.
