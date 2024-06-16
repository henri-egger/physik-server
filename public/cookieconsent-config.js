import 'https://cdn.jsdelivr.net/gh/orestbida/cookieconsent@3.0.1/dist/cookieconsent.umd.js';

/**
 * All config. options available here:
 * https://cookieconsent.orestbida.com/reference/configuration-reference.html
 */
CookieConsent.run({

  categories: {
      necessary: {
          enabled: true,  // this category is enabled by default
          readOnly: true  // this category cannot be disabled
      },
      analytics: {
        enabled: true,
        readonly: false,
      }
  },

  language: {
      default: 'de',
      translations: {
          de: {
              consentModal: {
                  title: 'Wir verwenden Cookies',
                  description: 'Cookie modal description',
                  acceptAllBtn: 'Alle akzeptieren',
                  acceptNecessaryBtn: 'Alle ablehnen',
                  showPreferencesBtn: 'Präferenzen verwalten'
              },
              preferencesModal: {
                  title: 'Präferenzen verwalten',
                  acceptAllBtn: 'Alle akzeptieren',
                  acceptNecessaryBtn: 'Alle ablehnen',
                  savePreferencesBtn: 'Meine Auswahl akzeptieren',
                  closeIconLabel: 'Close modal',
                  sections: [
                      {
                          title: 'Essenzielle Cookies',
                          description: 'Diese Cookies sind notwendig für das korrekte funktionieren der Website und können nicht ausgeschalten werden.',

                          //this field will generate a toggle linked to the 'necessary' category
                          linkedCategory: 'necessary'
                      },
                      {
                          title: 'Analytics',
                          description: 'Diese Cookies sammeln Daten über die Verwendung der Website. Alle Daten sind anonymisiert und können nicht verwendet werden um dich zu identifizieren.',
                          linkedCategory: 'analytics'
                      },
                      {
                          title: 'Mehr Information',
                          description: 'Für Fragen bezüglich der Verwendung von Cookies auf dieser Seite, bitte <a href="mailto:henri@moosbauer.com">kontaktiere mich</a>.'
                      }
                  ]
              }
          }
      }
  },

  guiOptions: {
    consentModal: {
        layout: 'cloud',
        position: 'bottom right',
        flipButtons: false,
        equalWeightButtons: true
    }
}
});