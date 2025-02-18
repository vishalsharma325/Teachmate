document.addEventListener('DOMContentLoaded', () => {
  lucide.createIcons();

  const chatContainer = document.getElementById('chat-container');
  const messageForm = document.getElementById('message-form');
  const messageInput = document.getElementById('message-input');
  const sendButton = document.getElementById('send-button');
  const themeToggle = document.getElementById('theme-toggle');
  const fileInput = document.getElementById('file-input');

  let isGenerating = false;

  addMessage("Hello! How can I help you today?", true);

  // Toggle Theme
  themeToggle.addEventListener('click', () => {
      document.body.classList.toggle('dark');
      themeToggle.querySelector('i').setAttribute(
          'data-lucide', document.body.classList.contains('dark') ? 'sun' : 'moon'
      );
      lucide.createIcons();
  });

  // Send Message
  messageForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const message = messageInput.value.trim();
      if (!message || isGenerating) return;

      addMessage(message, false);
      messageInput.value = '';
      await fetchGeminiResponse(message);
  });

  // Handle File Upload
  fileInput.addEventListener("change", async () => {
      const file = fileInput.files[0];
      if (file) {
          displayFile(file);
          await uploadAndAnalyzeFile(file);
      }
  });

  async function fetchGeminiResponse(userMessage) {
      isGenerating = true;
      messageInput.disabled = true;
      sendButton.disabled = true;
      addTypingIndicator();

      try {
          const response = await fetch('/ask', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ prompt: userMessage }),
          });

          const data = await response.json();
          removeTypingIndicator();
          addMessage(data.response || "⚠️ No response received.", true);
      } catch (error) {
          removeTypingIndicator();
          addMessage("⚠️ Error contacting AI server.", true);
      }

      isGenerating = false;
      messageInput.disabled = false;
      sendButton.disabled = false;
      messageInput.focus();
  }

  async function uploadAndAnalyzeFile(file) {
      const formData = new FormData();
      formData.append("file", file);

      addMessage(`📎 Uploading: ${file.name}...`, true);
      try {
          const response = await fetch("/upload", { method: "POST", body: formData });
          const data = await response.json();
          addMessage(data.response || "⚠️ Error analyzing file.", true);
      } catch (error) {
          addMessage("⚠️ Error uploading file.", true);
      }
  }

  function addMessage(content, isBot) {
      const messageDiv = document.createElement('div');
      messageDiv.className = `message ${isBot ? 'bot' : 'user'}`;

      const avatar = document.createElement('div');
      avatar.className = 'avatar';
      const icon = document.createElement('i');
      icon.setAttribute('data-lucide', isBot ? 'bot' : 'user');
      avatar.appendChild(icon);

      const messageContent = document.createElement('div');
      messageContent.className = 'message-content';
      messageContent.textContent = content;

      messageDiv.appendChild(avatar);
      messageDiv.appendChild(messageContent);

      chatContainer.appendChild(messageDiv);
      lucide.createIcons();
      scrollToBottom();
  }

  function displayFile(file) {
      const fileDiv = document.createElement("div");
      fileDiv.textContent = `📎 ${file.name}`;
      fileDiv.classList.add("file-preview");
      chatContainer.appendChild(fileDiv);
      chatContainer.scrollTop = chatContainer.scrollHeight;
  }

  function addTypingIndicator() {
      const messageDiv = document.createElement('div');
      messageDiv.className = 'message bot';
      messageDiv.id = 'typing-indicator';

      const avatar = document.createElement('div');
      avatar.className = 'avatar';
      const icon = document.createElement('i');
      icon.setAttribute('data-lucide', 'bot');
      avatar.appendChild(icon);

      const messageContent = document.createElement('div');
      messageContent.className = 'message-content';

      const typingDiv = document.createElement('div');
      typingDiv.className = 'typing-indicator';
      for (let i = 0; i < 3; i++) {
          const dot = document.createElement('div');
          dot.className = 'typing-dot';
          typingDiv.appendChild(dot);
      }

      messageContent.appendChild(typingDiv);
      messageDiv.appendChild(avatar);
      messageDiv.appendChild(messageContent);

      chatContainer.appendChild(messageDiv);
      lucide.createIcons();
      scrollToBottom();
  }

  function removeTypingIndicator() {
      const indicator = document.getElementById('typing-indicator');
      if (indicator) {
          indicator.remove();
      }
  }

  function scrollToBottom() {
      chatContainer.scrollTop = chatContainer.scrollHeight;
  }
});