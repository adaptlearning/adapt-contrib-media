import Adapt from 'core/js/adapt';
import MediaView from './mediaView';
import ComponentModel from 'core/js/models/componentModel';

export default Adapt.register('media', {
  // create a new class in the inheritance chain so it can be extended per component type if necessary later
  model: ComponentModel.extend({}),
  view: MediaView
});
