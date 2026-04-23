// CONFIGURATION

const CONFIG = {
  themes: ['dark', 'light', 'highContrast', 'ocean', 'pickle', 'hackerMan'],
  themeNames: {
    dark: 'Dark',
    light: 'Light',
    highContrast: 'High Contrast',
    ocean: 'Ocean',
    pickle: 'Pickle',
    hackerMan: 'Hacker Man',
  }
};

// STATE

let state = {
  service: 'OpenAI',
  mode: 'Text',
  theme: 'dark',
  systemPrompt: '',
  inputText: '',
  conversationHistory: [] // Array of {role: 'user'|'assistant', content: string}
};

let ui = {};

// SETUP

function setup() {
  noCanvas(); // We don't need a p5.js canvas - CSS handles it instead
  
  marked.setOptions({
    breaks: true,
    gfm: true
  });
  
  buildUI();
  applyTheme(state.theme);
  displayEmptyState();
}

// UI CONSTRUCTION

function buildUI() {
  // Create main container structure
  const body = select('body');
  body.html(''); // Clear default p5.js content
  
  const container = createDiv('');
  container.id('app-container');
  
  // Build header
  const header = buildHeader();
  container.child(header);
  
  // Build output area
  const outputArea = buildOutputArea();
  container.child(outputArea);
  
  // Build input area
  const inputArea = buildInputArea();
  container.child(inputArea);
  
  // Attach event listeners
  attachEventListeners();
}

function buildHeader() {
  const header = createDiv('');
  header.addClass('header');
  
  // Service selector
  const serviceLabel = createSpan('Service:');
  serviceLabel.addClass('header-label');
  header.child(serviceLabel);
  
  ui.serviceSelect = createSelect();
  ui.serviceSelect.option('OpenAI');
  ui.serviceSelect.option('Gemini');
  ui.serviceSelect.option('Claude');
  ui.serviceSelect.value(state.service);
  header.child(ui.serviceSelect);
  
  // Mode selector
  const modeLabel = createSpan('Mode:');
  modeLabel.addClass('header-label');
  header.child(modeLabel);
  
  ui.modeSelect = createSelect();
  ui.modeSelect.option('Text');
  ui.modeSelect.option('Image');
  ui.modeSelect.value(state.mode);
  header.child(ui.modeSelect);
  
  // Theme selector
  const themeLabel = createSpan('Theme:');
  themeLabel.addClass('header-label');
  header.child(themeLabel);
  
  ui.themeSelect = createSelect();
  CONFIG.themes.forEach(themeKey => {
    ui.themeSelect.option(CONFIG.themeNames[themeKey], themeKey);
  });
  ui.themeSelect.value(state.theme);
  header.child(ui.themeSelect);
  
  // Clear history button
  ui.clearButton = createButton('Clear History');
  ui.clearButton.addClass('secondary');
  header.child(ui.clearButton);
  
  return header;
}

function buildOutputArea() {
  const outputArea = createDiv('');
  outputArea.addClass('output-area');
  
  ui.outputBox = createDiv('');
  ui.outputBox.id('output-box');
  
  outputArea.child(ui.outputBox);
  
  return outputArea;
}

function buildInputArea() {
  const inputArea = createDiv('');
  inputArea.addClass('input-area');
  
  // System prompt row (shown only in text mode)
  ui.systemInputRow = createDiv('');
  ui.systemInputRow.addClass('input-row');
  
  ui.systemInput = createInput('', 'text');
  ui.systemInput.attribute('placeholder', 'System prompt (optional)');
  ui.systemInputRow.child(ui.systemInput);
  
  inputArea.child(ui.systemInputRow);
  
  // Main input row
  const mainInputRow = createDiv('');
  mainInputRow.addClass('input-row');
  
  ui.mainInput = createInput('', 'text');
  updatePlaceholder();
  mainInputRow.child(ui.mainInput);
  
  ui.sendButton = createButton('Send');
  mainInputRow.child(ui.sendButton);
  
  inputArea.child(mainInputRow);
  
  return inputArea;
}

// EVENT LISTENERS

function attachEventListeners() {
  ui.serviceSelect.changed(() => {
    state.service = ui.serviceSelect.value();
  });
  
  ui.modeSelect.changed(() => {
    state.mode = ui.modeSelect.value();
    updatePlaceholder();
    updateSystemPromptVisibility();
  });
  
  ui.themeSelect.changed(() => {
    state.theme = ui.themeSelect.value();
    applyTheme(state.theme);
  });
  
  ui.systemInput.input(() => {
    state.systemPrompt = ui.systemInput.value();
  });
  
  ui.mainInput.input(() => {
    state.inputText = ui.mainInput.value();
  });
  
  // Enter key submits
  ui.mainInput.elt.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      sendPrompt();
    }
  });
  
  ui.sendButton.mousePressed(sendPrompt);
  ui.clearButton.mousePressed(clearHistory);
}

// THEME MANAGEMENT

function applyTheme(themeName) {
  const body = select('body');
  
  // Remove all theme classes
  CONFIG.themes.forEach(theme => {
    body.removeClass(`theme-${theme}`);
  });
  
  // Add new theme class
  body.addClass(`theme-${themeName}`);
}

// UI UPDATES

function updatePlaceholder() {
  const placeholder = state.mode === 'Image' 
    ? 'Describe the image you want to generate...' 
    : 'Enter prompt...';
  ui.mainInput.attribute('placeholder', placeholder);
}

function updateSystemPromptVisibility() {
  if (state.mode === 'Image') {
    ui.systemInputRow.addClass('hidden');
  } else {
    ui.systemInputRow.removeClass('hidden');
  }
}

// API INTERACTION

async function sendPrompt() {
  if (!state.inputText.trim()) {
    return;
  }
  
  const userMessage = state.inputText.trim();
  
  // Add user message to conversation history
  state.conversationHistory.push({
    role: 'user',
    content: userMessage
  });
  
  // Display user message immediately
  displayUserMessage(userMessage);
  
  // Clear input
  clearInput();
  
  setLoadingState(true);
  
  try {
    const result = await sendToAI({
      service: state.service,
      mode: state.mode,
      systemPrompt: state.systemPrompt,
      prompt: userMessage,
      conversationHistory: state.conversationHistory
    });
    
    // Add assistant message to conversation history
    state.conversationHistory.push({
      role: 'assistant',
      content: result,
      isImage: state.mode === 'Image'
    });
    
    // Display assistant message
    displayAssistantMessage(result, state.mode === 'Image');
  } catch (err) {
    displayError(err.message);
  }
  
  setLoadingState(false);
}

// DISPLAY FUNCTIONS

function displayEmptyState() {
  ui.outputBox.html('<div class="empty-state">Start a conversation...</div>');
}

function displayUserMessage(content) {
  if (ui.outputBox.elt.querySelector('.empty-state')) {
    ui.outputBox.html('');
  }
  
  const messageDiv = createDiv('');
  messageDiv.addClass('chat-message');
  messageDiv.addClass('user');
  
  const roleDiv = createDiv('You');
  roleDiv.addClass('message-role');
  messageDiv.child(roleDiv);
  
  const contentDiv = createDiv(content);
  contentDiv.addClass('message-content');
  messageDiv.child(contentDiv);
  
  ui.outputBox.child(messageDiv);
  scrollToBottom();
}

function displayAssistantMessage(content, isImage) {
  const messageDiv = createDiv('');
  messageDiv.addClass('chat-message');
  messageDiv.addClass('assistant');
  
  // const roleDiv = createDiv('Assistant');
  const roleDiv = createDiv(state.service);
  
  roleDiv.addClass('message-role');
  messageDiv.child(roleDiv);
  
  const contentDiv = createDiv('');
  contentDiv.addClass('message-content');
  
  if (isImage) {
    contentDiv.html(`
      <div class="image-container">
        <img src="${content}" class="generated-image" alt="Generated image" />
      </div>
    `);
  } else {
    contentDiv.addClass('markdown-body');
    contentDiv.html(marked.parse(content));
  }
  
  messageDiv.child(contentDiv);
  ui.outputBox.child(messageDiv);
  scrollToBottom();
}

function displayError(message) {
  const messageDiv = createDiv('');
  messageDiv.addClass('chat-message');
  messageDiv.addClass('assistant');
  
  const roleDiv = createDiv('Error');
  roleDiv.addClass('message-role');
  messageDiv.child(roleDiv);
  
  const contentDiv = createDiv('');
  contentDiv.addClass('message-content');
  contentDiv.html(`<span style="color: #ff6b6b;">${message}</span>`);
  messageDiv.child(contentDiv);
  
  ui.outputBox.child(messageDiv);
  scrollToBottom();
}

function setLoadingState(isLoading) {
  if (isLoading) {
    ui.sendButton.html('Sending...');
    ui.sendButton.attribute('disabled', '');
  } else {
    ui.sendButton.html('Send');
    ui.sendButton.removeAttribute('disabled');
  }
}

function clearInput() {
  ui.mainInput.value('');
  state.inputText = '';
}

function clearHistory() {
  state.conversationHistory = [];
  displayEmptyState();
}

function scrollToBottom() {
  ui.outputBox.elt.scrollTop = ui.outputBox.elt.scrollHeight;
}