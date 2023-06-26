const API_URL = "http://localhost:8000";
const socket = io(API_URL);

// Retrieve the value of a query parameter from the URL
function getQueryParameter(parameterName) {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  return urlParams.get(parameterName);
}

const group_id = parseInt(getQueryParameter("group_id"));
const username = getQueryParameter("username");

// Emit a "joinRoom" event with username and group_id
socket.emit("joinRoom", { username, group_id });

// Listen for "message" event from the server
socket.on("message", (data) => {
  console.log("Message from server:", data);
  displayMessage(data);
});

// Listen for "file" event from the server
socket.on("file", (data) => {
  console.log("File from server:", data);
  displayFile(data);
});

const getMessage = async () => {
  try {
    const response = await axios.post(`${API_URL}/getmessages`, { group_id });
    const messageData = response.data;
    messageData.forEach((data) => {
      console.log(data);
      const { username, message,isFile } = data;
      if(isFile){
        const filename=message;
        displayFile({ username,  filename });

      }else{
        displayMessage({ username, message });

      }
    });
  } catch (error) {
    console.error(error);
  }
};
getMessage();

const storeMessage = async (data) => {
  try {
    const response = await axios.post(`${API_URL}/messages`, data);
    console.log(response.data);
  } catch (error) {
    console.error(error);
  }
};

// Display the username and group_id in the console
console.log(`Username: ${username}`);
console.log(typeof group_id);

const findGroupNameByGroupId = async (group_id) => {
  try {
    const response = await axios.post(`${API_URL}/findGroupNameByGroupId`, {
      group_id: group_id,
    });

    const data = response.data;
    document.getElementById("roomInfo").innerText = `Room: ${data}       Username: ${username}`;
  } catch (error) {
    console.error("Error getting group name:", error);
    throw error;
  }
};

findGroupNameByGroupId(group_id);

const users = document.getElementById("users");

async function findAllUsersInGroup() {
  try {
    const response = await axios.post(`${API_URL}/findAllUsersInGroup`, {
      group_id,
    });

    const data = response.data;
    data.forEach((element) => {
      const li = document.createElement("li");
      li.classList.add("list-group-item");
      li.textContent = element;
      users.appendChild(li);
    });
  } catch (error) {
    console.error("Error finding users in group:", error);
  }
}

findAllUsersInGroup();

function sendMessageOrFile() {
  const messageInput = document.getElementById("messageInput");
  const fileInput = document.getElementById("fileInput");

  if (messageInput.value.trim() !== "") {
    sendMessage();
  } else if (fileInput.files.length > 0) {
    sendFile(fileInput.files[0]);
  }
}

function sendMessage() {
  const messageInput = document.getElementById("messageInput");
  const message = messageInput.value.trim();

  if (message !== "") {
    socket.emit("message", { username, group_id, message });
    storeMessage({ username, group_id, message });
    messageInput.value = "";
  }
}
async function sendFile(file) {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await axios.post(`${API_URL}/upload`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    const filename = response.data.filename;
    socket.emit("file", { username, group_id, filename });
    storeMessage({ username, group_id, message:filename,isFile:true });

  } catch (error) {
    console.error(error);
  }
}

function openFileInput() {
  document.getElementById("fileInput").click();
}

function displayMessage(data) {
  const messagesContainer = document.getElementById("messages");
  const messageElement = document.createElement("p");
  const usernameElement = document.createElement("b");
  usernameElement.innerText = data.username;
  const messageText = document.createTextNode(`: ${data.message}`);
  messageElement.appendChild(usernameElement);
  messageElement.appendChild(messageText);
  messagesContainer.appendChild(messageElement);

  // Scroll down to the latest message
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function displayFile(data) {
  const messagesContainer = document.getElementById("messages");
  const fileElement = document.createElement("p");
  const usernameElement = document.createElement("b");
  usernameElement.innerText = data.username;
  const fileLink = document.createElement("a");
  fileLink.href = `${API_URL}/uploads/${data.filename}`;
  fileLink.target = "_blank";
  fileLink.innerText = "Download File";
  fileElement.appendChild(usernameElement);
  fileElement.appendChild(document.createTextNode(": "));
  fileElement.appendChild(fileLink);
  messagesContainer.appendChild(fileElement);

  // Scroll down to the latest message
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function handleMessageInput(event) {
  if (event.keyCode === 13) {
    sendMessage();
  }
}

document.getElementById("messageInput").addEventListener("keydown", handleMessageInput);
document.getElementById("fileInput").addEventListener("change", handleFileInput);
document.getElementById("sendButton").addEventListener("click", sendMessageOrFile);


