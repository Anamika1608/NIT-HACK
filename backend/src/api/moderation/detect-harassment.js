const express = require('express');
const router = express.Router();
const axios=require("axios")

// const { GoogleGenerativeAI } = require('@google/generative-ai');
// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// route: "/api/v1/moderation/detect-harassment" -> payload: { message: "", platform: ""}

// router.post('/detect-harassment', async (req, res) => {
//   try {
//     const { message, platform } = req.body;

//     if (!message || typeof message !== 'string' || message.trim() === '') {
//       return res.status(400).json({
//         status: 'error',
//         message: 'Invalid or missing message'
//       });
//     }

//     const systemPrompt = `You are an AI harassment detection assistant. 
//     Carefully analyze the given text and provide a detailed JSON response 
//     with the following boolean keys:

//     Provide a STRICT JSON response WITHOUT any markdown or code block formatting. 
      
//       {
//         "isHarassment": true/false,
//         "isVulgar": true/false,
//         "isThreatening": true/false,
//         "isSexuallyExplicit": true/false,
//         "isPotentiallyOffensive": true/false,
//         "analysis": "detailed analysis text"
//       }
//     This is the platform where user has received the message: ${platform}.
//     Also do these harrassment checks based on platform and situation, like no one should ask any user about they have a
//     boyfriend or not, since linkedin is a professional platform, but this same thing might be routerropriate for instagram.
//     `  

//     const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
//     const result = await model.generateContent(`${systemPrompt}\n\nMessage to analyze: ${message}`);
//     const response = await result.response;
//     const text = await response.text();
    
//     let analysisResult;
//     try {
//       analysisResult = JSON.parse(text);
//     } catch (parseError) {
//       try {
//         const cleanedText = text.replace(/^```json\n/, '').replace(/\n```$/, '');
//         analysisResult = JSON.parse(cleanedText);
//       } catch (cleanParseError) {
//         analysisResult = {
//           isHarassment: /harassment detected/i.test(text),
//           isVulgar: /vulgar/i.test(text),
//           isThreatening: /threatening/i.test(text),
//           isSexuallyExplicit: /sexually explicit/i.test(text),
//           isPotentiallyOffensive: /offensive/i.test(text),
//           analysis: text
//         };
//       }
//     }
//     res.json({
//       status: 'success',
//       analysis: analysisResult
//     });
//   } catch (error) {
//     console.error('Message analysis error:', error);
//     res.status(500).json({
//       status: 'error',
//       message: 'Failed to analyze message',
//       error: error.toString()
//     });
//   }
// });


const config = {
  healthCheck: {
      interval: 50000,
      timeout: 5000,
      unhealthyThreshold: 2,
      healthyThreshold: 2
  },
  circuitBreaker: {
      failureThreshold: 5,
      resetTimeout: 60000
  },
  rateLimit: {
      windowMs: 60000,
      maxRequests: 100
  }
};

const serverStates = new Map();

const servers = [
  "https://backend-1-safedm.onrender.com",
  "https://backend-2-safedm.onrender.com",
  "https://backend-3-safedm.onrender.com",
  "https://backend-4-safedm.onrender.com",
  "https://backend-5-safedm.onrender.com",
  // "http://localhost:3000"
].map(url => ({
  url,
  weight: 1,
  healthy: true,
  activeConnections: 0,
  lastResponse: 0,
  failCount: 0,
  successCount: 0,
  totalRequests: 0,
  errorRate: 0
}));

// const limiter = rateLimit({
//   windowMs: config.rateLimit.windowMs,
//   max: config.rateLimit.maxRequests
// });

// let currentServerIndex = 0;

// const getNextServer = () => {
//     const server = servers[currentServerIndex];
//     currentServerIndex = (currentServerIndex + 1) % servers.length;
//     return server;
// };

// const checkServerHealth = async (serverUrl) => {
//     try {
//         const response = await axios.get(`${serverUrl}/health`);
//         return response.status === 200;
//     } catch (error) {
//         return false;
//     }
// };

// router.use(express.json());

// router.post('/detect-harassment', async (req, res) => {
//     let attempts = 0;
//     const maxAttempts = servers.length;

//     while (attempts < maxAttempts) {
//         const server = getNextServer();
        
//         try {
//             const isHealthy = await checkServerHealth(server);
//             if (!isHealthy) {
//                 attempts++;
//                 continue;
//             }

//             const response = await axios.post(`${server}/detect`, req.body);
//             return res.json(response.data);
//         } catch (error) {
//             attempts++;
//             console.error(`Error with server ${server}:`, error.message);
//         }
//     }

//     res.status(503).json({ error: 'All servers are currently unavailable' });
// });

const getCircuitBreakerState = (serverUrl) => {
  if (!serverStates.has(serverUrl)) {
      serverStates.set(serverUrl, {
          status: 'CLOSED',
          failures: 0,
          lastError: null
      });
  }
  return serverStates.get(serverUrl);
};

const updateCircuitBreaker = (serverUrl, success) => {
  const state = getCircuitBreakerState(serverUrl);
  
  if (success) {
      state.status = 'CLOSED';
      state.failures = 0;
  } else {
      state.failures += 1;
      state.lastError = Date.now();
      
      if (state.failures >= config.circuitBreaker.failureThreshold) {
          state.status = 'OPEN';
      }
  }
};

const getWeightedServer = () => {
  const healthyServers = servers.filter(server => server.healthy);
  if (healthyServers.length === 0) return null;

  const totalWeight = healthyServers.reduce((sum, server) => sum + server.weight, 0);
  let random = Math.random() * totalWeight;
  
  return healthyServers.find(server => {
      random -= server.weight;
      return random <= 0;
  }) || healthyServers[0];
};

const getLeastConnectionsServer = () => {
  const healthyServers = servers.filter(server => server.healthy);
  if (healthyServers.length === 0) return null;

  return healthyServers.reduce((min, server) => 
      server.activeConnections < min.activeConnections ? server : min
  );
};

const getFastestResponseServer = () => {
  const healthyServers = servers.filter(server => server.healthy);
  if (healthyServers.length === 0) return null;

  return healthyServers.reduce((fastest, server) => 
      server.lastResponse < fastest.lastResponse ? server : fastest
  );
};

const checkServerHealth = async (server) => {
  const startTime = Date.now();
  try {
      const response = await axios.get(`${server.url}/health`, {
          timeout: config.healthCheck.timeout
      });
      
      const responseTime = Date.now() - startTime;
      server.lastResponse = responseTime;
      
      if (response.status === 200) {
          server.successCount++;
          server.failCount = 0;
          server.healthy = server.successCount >= config.healthCheck.healthyThreshold;
      }
      
      return true;
  } catch (error) {
      server.failCount++;
      server.successCount = 0;
      server.healthy = server.failCount < config.healthCheck.unhealthyThreshold;
      return false;
  }
};

setInterval(() => {
  servers.forEach(server => checkServerHealth(server));
}, config.healthCheck.interval);

const handleRequest = async (server, req) => {
  const circuitState = getCircuitBreakerState(server.url);
  
  if (circuitState.status === 'OPEN') {
      if (Date.now() - circuitState.lastError > config.circuitBreaker.resetTimeout) {
          circuitState.status = 'HALF_OPEN';
      } else {
          throw new Error('Circuit breaker is OPEN');
      }
  }

  server.activeConnections++;
  const startTime = Date.now();
  
  try {
      const response = await axios.post(`${server.url}/detect`, req.body);
      server.activeConnections--;
      server.totalRequests++;
      
      const requestTime = Date.now() - startTime;
      server.lastResponse = requestTime;
      
      updateCircuitBreaker(server.url, true);
      return response.data;
  } catch (error) {
      server.activeConnections--;
      updateCircuitBreaker(server.url, false);
      throw error;
  }
};

router.post('/detect-harassment', async (req, res) => {
  let attempts = 0;
  const maxAttempts = servers.length;

  while (attempts < maxAttempts) {
      const selectionStrategies = [
          getWeightedServer,
          getLeastConnectionsServer,
          getFastestResponseServer
      ];
      
      const server = selectionStrategies[attempts % 3]();
      if (!server) {
          res.status(503).json({ error: 'No healthy servers available' });
          return;
      }

      try {
          const result = await handleRequest(server, req);
          return res.json(result);
      } catch (error) {
          attempts++;
          console.error(`Error with server ${server.url}:`, error.message);
          
          server.errorRate = (server.errorRate * server.totalRequests + 1) / (server.totalRequests + 1);
          
          server.weight = Math.max(0.1, 1 - server.errorRate);
      }
  }

  res.status(503).json({ 
      error: 'All servers are currently unavailable',
      retryAfter: 5
  });
});

router.get('/metrics', (req, res) => {
  const metrics = servers.map(server => ({
      url: server.url,
      healthy: server.healthy,
      activeConnections: server.activeConnections,
      totalRequests: server.totalRequests,
      averageResponseTime: server.lastResponse,
      errorRate: server.errorRate,
      weight: server.weight,
      circuitBreakerStatus: getCircuitBreakerState(server.url).status
  }));
  
  res.json(metrics);
});


module.exports = router;