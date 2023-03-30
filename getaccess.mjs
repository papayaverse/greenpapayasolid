import {
  getSolidDatasetWithAcl,
  hasResourceAcl,
  hasFallbackAcl,
  hasAccessibleAcl,
  createAcl,
  createAclFromFallbackAcl,
  getResourceAcl,
  setAgentResourceAccess,
  saveAclFor,
} from "@inrupt/solid-client";
import { handleIncomingRedirect, login, fetch, getDefaultSession } from '@inrupt/solid-client-authn-browser'
import { getSolidDataset, saveSolidDatasetAt } from "@inrupt/solid-client";

async function loginAnd() {
  // 1. Call `handleIncomingRedirect()` to complete the authentication process.
  //    If called after the user has logged in with the Solid Identity Provider, 
  //      the user's credentials are stored in-memory, and
  //      the login process is complete. 
  //   Otherwise, no-op.  
  await handleIncomingRedirect();

  // 2. Start the Login Process if not already logged in.
  if (!getDefaultSession().info.isLoggedIn) {
    await login({
      // Specify the URL of the user's Solid Identity Provider;
      // e.g., "https://login.inrupt.com".
      oidcIssuer: "https://login.solidcommunity.net",
      // Specify the URL the Solid Identity Provider should redirect the user once logged in,
      // e.g., the current page for a single-page app.
      redirectUrl: window.location.href,
      // Provide a name for the application when sending to the Solid Identity Provider
      clientName: "My application"
    });
  }

  // 3. Make authenticated requests by passing `fetch` to the solid-client functions.
  // The user must have logged in as someone with the appropriate access to the specified URL.
  
  // For example, the user must be someone with Write access to the specified URL.
  window.alert("Logged in");
}

async function getacl() {
const myDatasetWithAcl = await getSolidDatasetWithAcl("https://rammkripa.solidcommunity.net/private/testtext.md");
const accessByAgent = getAgentAccessAll(myDatasetWithAcl);
window.alert(accessByAgent);
}

// => an object like
//    {
//      "https://example.com/profile#webid":
//        { read: true, append: false, write: false, control: true },
//      "https://example.com/other-profile#webid":
//        { read: true, append: false, write: false, control: false },
//    }
