import { TestBed } from '@angular/core/testing';
import { SessionService } from './session.service';

describe('SessionService', () => {
  let service: SessionService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(SessionService);
  });

  it('should generate a valid UUID session', () => {
    const id = service.getSessionId();
    expect(id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    );
  });

  it('should persist session across instances', () => {
    const id1 = service.getSessionId();
    // New instance should read the same stored ID
    const service2 = new SessionService();
    expect(service2.getSessionId()).toEqual(id1);
  });
});
