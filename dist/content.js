// content.js

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "SHOW_DISTRACTING_OVERLAY") {
      // Check if the overlay already exists; if so, do nothing.
      if (!document.getElementById("distracting-overlay")) {
        const overlay = document.createElement("div");
        overlay.id = "distracting-overlay";
        // Style the overlay to cover the entire screen.
        Object.assign(overlay.style, {
          position: "fixed",
          top: "0",
          left: "0",
          width: "100vw",
          height: "100vh",
          backgroundColor: "rgba(0, 0, 0, 0.9)",
          zIndex: "999999",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          fontSize: "24px",
          textAlign: "center",
          padding: "20px"
        });
  
        // Insert a message into the overlay.
        overlay.innerHTML = `
          <div>
            <p>This site <strong>${message.url}</strong> has been detected as distracting!</p>
            <p>(Response Time: ${message.responseTime}ms)</p>
            <p style="font-size: 16px;">Switch tabs to dismiss this overlay.</p>
          </div>
        `;
  
        // Append the overlay to the document body.
        document.body.appendChild(overlay);
      }
    }
  });
  