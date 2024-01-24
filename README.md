# SideGPT

SideGPT provide a application that allows users to interact with OpenAI's models through a simple and user-friendly interface. This app is for demo purpose to test OpenAI API and may contain issues/bugs.

## Features
 - UI matching ChatGPT
 - Configure Proxy, Reverse Proxy

## Getting Started

To get started with this project, you'll need to clone the repository and have [Nodejs](https://nodejs.org/en/download) installed on your system.

### Cloning the Repository

Run the following command to clone the repository:  

```
git clone https://github.com/luckyJeffy/side-gpt.git
```

### Install Dependencies

Navigate to the project directory:
```
cd side-gpt
```

Install the dependencies:
```
npm i --verbose
```

### Launch the application

To launch the application, first modify `backend/.env` as needed.


Then run the following command:
```
npm run dev
```

Access the application in your browser using the URL:

```
http://127.0.0.1:5173
```
or
```
http://localhost:5173
```

## Additional Note

### `backend/.env`

| Field                   	| Description                                                                           	| Required 	|
|-------------------------	|---------------------------------------------------------------------------------------	|----------	|
| `CHAT_GPT_API_BASE_URL` 	| chatGPT model API address, fill in the value according to different service providers 	| `true`   	|
| `CHAT_GPT_API_DEBUG`    	| Enable debug mode, which will print details on the console when enabled               	| `false`  	|
| `API_PROXY`             	| Proxy for requesting model API, only HTTP/HTTPS proxies are supported                 	| `false`  	|

# Contributions

Contributions, suggestions, bug reports and fixes are welcome!

For new features, components, or extensions, please open an issue and discuss before sending a PR. 

# License

MIT