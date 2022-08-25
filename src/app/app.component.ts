import { environment } from './../environments/environment';
import { Component } from '@angular/core';

declare var google: any;
declare var gapi: any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'google-gsi-angular-app';
  private auth2: any;
  private GOOGLE_CLIENT_ID = environment.google_client_id;
  private GOOGLE_CLIENT_SECRET_KEY = environment.google_client_secret;
  private GOOGLE_SCOPE = environment.google_scope;

  constructor() {
    console.log(environment.production);
  }

  ngOnInit() {
    if (google.accounts.auth2) {
      let auth2 = google.accounts.auth2.getAuthInstance();
      auth2.disconnect();
    }
  }

  ngAfterViewInit() {
    this.googleGAPIInit();
    this.googleOAuth2TokenInit();
  }

  /**
   * Reference: https://developers.google.com/identity/oauth2/web/guides/migration-to-gis#gapi-callback
   */
  public googleGAPIInit() {
    gapi.load('client', () => {});
  }

  // Google OAuth2 Implicit Flow
  public googleOAuth2TokenInit() {
    console.log('googleOAuth2TokenInit');
    this.auth2 = google.accounts.oauth2.initTokenClient({
      client_id: this.GOOGLE_CLIENT_ID,
      cookiepolicy: 'single_host_origin',
      scope: this.GOOGLE_SCOPE,
      hd: 'siamintec.co.th',
      callback: '', // Leave blank for set up at handleSignIn()
    });
  }

  public authenticateGoogle() {
    console.log('handleSignIn');
    this.auth2.callback = (response: any) => {
      if (response.error !== undefined) {
        throw response;
      }

      // GIS has automatically updated gapi.client with the newly issued access token.
      console.log(
        'gapi.client access token: ' + JSON.stringify(gapi.client.getToken())
      );
      let credential = gapi.client.getToken();

      // Get user profile
      // Use xhr() instead to avoid CORS issue
      // You can use httpClient when deploying to production
      let xhr = new XMLHttpRequest();
      xhr.onreadystatechange = () => {
        if (xhr.readyState === 4 && xhr.status === 200) {
          let userProfile = JSON.parse(xhr.responseText);
          this.signinCallback(userProfile);
        }
      };
      xhr.open('GET', 'https://www.googleapis.com/oauth2/v2/userinfo');
      xhr.setRequestHeader(
        'Authorization',
        `Bearer ${credential.access_token}`
      );
      xhr.send();
    };

    if (gapi.client.getToken() === null) {
      this.auth2.requestAccessToken();
    }
  }

  public handleSignOut() {
    console.log('handleSignOut');
    // Get the current access token from gapi.client
    let credential = gapi.client.getToken();
    if (credential !== null) {
      // Clear the current access token
      google.accounts.oauth2.revoke(credential.access_token, () => {
        console.log('Revoked: ' + credential.access_token);
      });
      // Clear gapi.client token
      gapi.client.setToken('');
    }
  }

  private signinCallback(user: any) {
    console.log(user);
    // let currentComponentObject = this;
    // //clear error message
    // currentComponentObject.loginModel.Message = '';
    // currentComponentObject.loginModel.errorMessage = '';
    // console.log('profile: ' + profile);
    // if (profile) {
    //   let user = profile.name;
    //   let email = profile.email;
    //   if (email && email.split('@').length > 0) {
    //     let domain = profile.email.split('@')[1];
    //     if (domain.toLowerCase() == Constants.EMAIL_DOMAIN) {
    //       currentComponentObject.loginModel.Email = email;
    //       this.ngZone.run(() => {
    //         //login
    //         currentComponentObject.login(user, true);
    //       });
    //     } else {
    //       this.ngZone.run(() => {
    //         if (google.accounts.auth2) {
    //           let auth2 = google.accounts.auth2.getAuthInstance();
    //           auth2.disconnect();
    //           auth2.signOut();
    //         }
    //         currentComponentObject.loginModel.errorMessage =
    //           'User is not allowed to sign in with google.';
    //       });
    //     }
    //   }
    // }
  }

  //// Google Single Sign On
  // public googleSignInInit() {
  //   console.log('googleGSIInit');
  //   google.accounts.id.initialize({
  //     client_id: this.GOOGLE_CLIENT_ID,
  //     callback: this.onGoogleSignInResponse,
  //   });

  //   google.accounts.id.prompt((notification: any) => {
  //     if (notification.isNotDisplayed()) {
  //       console.log('User has already granted permission');
  //     } else if (notification.isSkippedMoment()) {
  //       console.log('User has already granted permission');
  //     }
  //   });

  //   google.accounts.id.renderButton(
  //     document.getElementById('google-signin-button'),
  //     {
  //       theme: 'filled_blue',
  //       size: 'large',
  //       width: 250,
  //     }
  //   );
  // }

  // public onGoogleSignInResponse(response: any) {
  //   console.log('onGoogleSignInResponse');
  //   console.log(response);
  //   if (response.credential) {
  //     console.log('User has granted permission');
  //     console.log(response.credential);
  //   } else {
  //     console.log('User has not granted permission');
  //   }
  // }

  // // Google OAuth2 Code Flow
  // public googleOAuth2CodeInit() {
  //   console.log('googleOAuth2CodeInit');
  //   this.oauth2Client = google.accounts.oauth2.initCodeClient({
  //     client_id: this.GOOGLE_CLIENT_ID,
  //     ux_mode: 'popup',
  //     scope: this.GOOGLE_SCOPE,
  //     redirect_uri: 'http://localhost:4200',
  //     callback: this.onGoogleOAuth2CodeResponse,
  //   });
  // }

  // public onGoogleOAuth2CodeResponse(response: any) {
  //   console.log('onGoogleOAuth2CodeResponse');
  //   console.log(response);
  //   if (response.code) {
  //     console.log('User has granted permission');
  //     console.log(response.code);
  //   } else {
  //     console.log('User has not granted permission');
  //   }
  // }

  // public onGoogleOAuth2TokenResponse(response: any) {
  //   console.log('onGoogleOAuth2TokenResponse');
  //   console.log(response);
  //   if (response.access_token) {
  //     console.log('User has granted permission');
  //     console.log(response.access_token);
  //   } else {
  //     console.log('User has not granted permission');
  //   }
  // }

  // public handleRequestOAuth2AccessToken() {
  //   console.log('handleGetTokenInfo');
  //   this.oauth2Client.requestAccessToken();
  // }

  // public handleRequestOAuth2Code() {
  //   console.log('handleRequestOAuth2Code');
  //   this.oauth2Client.requestCode();
  // }
}
