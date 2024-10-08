describe('Media', function () {
  beforeEach(function () {
    cy.getData();
  });

  it('should display the media component', function () {
    const mediaComponents = this.data.components.filter(component => component._component === 'media');
    const stripHtml = cy.helpers.stripHtml;
    mediaComponents.forEach(mediaComponent => {
      cy.visit(`/#/preview/${mediaComponent._id}`);

      cy.testContainsOrNotExists('.media__body', stripHtml(mediaComponent.body));
      cy.testContainsOrNotExists('.media__title', stripHtml(mediaComponent.displayTitle));
      cy.testContainsOrNotExists('.media__instruction', stripHtml(mediaComponent.instruction));

      if (mediaComponent._media.mp4) {
        cy.get('.mejs-mediaelement video').should('have.attr', 'src', mediaComponent._media.mp4);
      };
      if (mediaComponent._media.poster) {
        cy.get('.mejs-poster img').should('have.attr', 'src', mediaComponent._media.poster);
      };

      if (mediaComponent._transcript) {
        if (mediaComponent._transcript._inlineTranscript) {
          cy.get('.media__transcript-body-inline').should('not.be.visible');
          cy.get('button.media__transcript-btn-inline').should('be.visible');
          cy.get('button.media__transcript-btn-inline').should('contain', mediaComponent._transcript.inlineTranscriptButton).click();
          cy.get('.media__transcript-body-inline-inner').should('be.visible').should('contain', stripHtml(mediaComponent._transcript.inlineTranscriptBody));
          cy.get('button.media__transcript-btn-inline').should('contain', mediaComponent._transcript.inlineTranscriptCloseButton).click();
          cy.get('.media__transcript-body-inline').should('not.be.visible');
        } else {
          cy.get('button.media__transcript-btn-inline').should('not.exist');
        }

        if (mediaComponent._transcript._externalTranscript) {
          cy.get('button.media__transcript-btn-external').should('be.visible')
          cy.get('button.media__transcript-btn-external').should('contain', mediaComponent._transcript.transcriptLinkButton);
        } else {
          cy.get('button.media__transcript-btn-external').should('not.exist')
        }
      };

      // Allow the component to load and run external custom tests
      cy.wait(1000);
    });
  });
});
