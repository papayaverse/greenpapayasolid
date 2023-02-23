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
}

loginAnd();

// Fetch the SolidDataset and its associated ACLs, if available:
const myDatasetWithAcl = await getSolidDatasetWithAcl("https://rammkripa.solidcommunity.net/private/testtext.md");

// Obtain the SolidDataset's own ACL, if available,
// or initialise a new one, if possible:
let resourceAcl;
if (!hasResourceAcl(myDatasetWithAcl)) {
  if (!hasAccessibleAcl(myDatasetWithAcl)) {
    throw new Error(
      "The current user does not have permission to change access rights to this Resource."
    );
  }
  if (!hasFallbackAcl(myDatasetWithAcl)) {
    throw new Error(
      "The current user does not have permission to see who currently has access to this Resource."
    );
    // Alternatively, initialise a new empty ACL as follows,
    // but be aware that if you do not give someone Control access,
    // **nobody will ever be able to change Access permissions in the future**:
    // resourceAcl = createAcl(myDatasetWithAcl);
  }
  resourceAcl = createAclFromFallbackAcl(myDatasetWithAcl);
} else {
  resourceAcl = getResourceAcl(myDatasetWithAcl);
}

// Give someone Control access to the given Resource:
const updatedAcl = setAgentResourceAccess(
  resourceAcl,
  "https://ramtest.solidcommunity.net/profile/card#me",
  { read: true, append: false, write: false, control: true }
);

// Now save the ACL:
await saveAclFor(myDatasetWithAcl, updatedAcl);