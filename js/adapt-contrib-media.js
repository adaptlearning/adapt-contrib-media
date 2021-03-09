define([
  'core/js/adapt',
  './mediaView',
  'core/js/models/componentModel'
], function(Adapt, MediaView, ComponentModel) {

  return Adapt.register('media', {
    model: ComponentModel.extend({}), // create a new class in the inheritance chain so it can be extended per component type if necessary later
    view: MediaView
  });

});
