import DefaultText from './text';

export default class WithFallback extends DefaultText {
  get aa() {
    return this.bb;
  }
  get cc() {
    return this.bb;
  }
}
