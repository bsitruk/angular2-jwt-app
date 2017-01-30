import { Angular2JwtAppPage } from './app.po';

describe('angular2-jwt-app App', function() {
  let page: Angular2JwtAppPage;

  beforeEach(() => {
    page = new Angular2JwtAppPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
