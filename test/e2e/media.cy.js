describe('Media', function () {
  beforeEach(function () {
    cy.getData()
  });

  it('should display the media component', function () {
    const mediaComponents = this.data.components.filter((component) => component._component === 'media')
    mediaComponents.forEach((mediaComponent) => {
      cy.visit(`/#/preview/${mediaComponent._id}`);
      const bodyWithoutHtml = mediaComponent.body.replace(/<[^>]*>/g, '');
      
      cy.testContainsOrNotExists('.media__title', mediaComponent.displayTitle)
      cy.testContainsOrNotExists('.media__body', bodyWithoutHtml)
      cy.testContainsOrNotExists('.media__instruction', mediaComponent.instruction)

      if(mediaComponent._media.mp4) {
        cy.get('.mejs-mediaelement video').should('have.attr', 'src', mediaComponent._media.mp4)
      }
      if(mediaComponent._media.poster) {
        cy.get('.mejs-poster img').should('have.attr', 'src', mediaComponent._media.poster)
      }

      if(mediaComponent._transcript) {
        cy.get('.media__transcript-body-inline').should('not.be.visible')
        cy.get('button.media__transcript-btn').should('contain', mediaComponent._transcript.inlineTranscriptButton).click()
        cy.get('.media__transcript-body-inline-inner').should('be.visible').should('contain', mediaComponent._transcript.inlineTranscriptBody)
        cy.get('button.media__transcript-btn').should('contain', mediaComponent._transcript.inlineTranscriptCloseButton).click()
        cy.get('.media__transcript-body-inline').should('not.be.visible')
      }

      cy.wait(1000)
    });
  });
});