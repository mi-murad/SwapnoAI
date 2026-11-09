import { db } from '../db/database';
import { authService } from '../auth/authService';

async function runTenantIsolationTests() {
  console.log('====================================================');
  console.log('SWAPNO AI — TENANT ISOLATION & PERSISTENCE TEST SUITE');
  console.log('====================================================\n');

  let passedTests = 0;
  let totalTests = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    totalTests++;
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passedTests++;
    } else {
      console.error(`[FAIL] ${testName} - ${detail || 'Assertion failed'}`);
      throw new Error(`Test failed: ${testName}`);
    }
  }

  try {
    // 1. Register User 1 (Dhaka Elegance)
    console.log('Step 1: Registering User 1 (Alice - Dhaka Elegance)...');
    const user1Email = `alice_${Date.now()}@dhakaelegance.com`;
    const user1Res = await authService.register(
      user1Email,
      'Password123!',
      'Alice Rahman',
      'Dhaka Elegance',
      {
        industry: 'Fashion & Boutique',
        tone: 'Luxury, Cultural, Graceful'
      }
    );
    assert(!!user1Res.token, 'User 1 received valid JWT session token');
    assert(!!user1Res.workspace.id, 'User 1 provisioned dedicated workspace');
    const ws1Id = user1Res.workspace.id;
    const newWorkspaceState = db.getWorkspaceData(ws1Id);
    const newWorkspaceTrial = db.getTrialSnapshot(ws1Id);
    assert(newWorkspaceState?.businessSetup.products === '', 'New workspace products start blank');
    assert(newWorkspaceState?.businessSetup.goals === '', 'New workspace goals start blank');
    assert(newWorkspaceState?.strategy.channels.length === 0, 'New workspace strategy contains no sample channels');
    assert(newWorkspaceTrial?.status === 'active', 'New workspace receives an active server-calculated trial');
    assert(newWorkspaceTrial?.durationDays === 7, 'New workspace trial uses the configured seven-day default');
    assert(newWorkspaceTrial?.cardRequired === false && newWorkspaceTrial.automaticCharge === false, 'Trial requires no card and does not auto-charge');

    // 2. Register User 2 (Dhaka Flower Tub)
    console.log('\nStep 2: Registering User 2 (Bob - Dhaka Flower Tub)...');
    const user2Email = `bob_${Date.now()}@flowerhub.com`;
    const user2Res = await authService.register(
      user2Email,
      'Password123!',
      'Bob Ahmed',
      'Dhaka Flower Tub',
      {
        industry: 'Botanical & Gardening',
        tone: 'Earthy, Sustainable, Vibrant'
      }
    );
    assert(!!user2Res.token, 'User 2 received valid JWT session token');
    assert(!!user2Res.workspace.id, 'User 2 provisioned dedicated workspace');
    const ws2Id = user2Res.workspace.id;
    assert(ws1Id !== ws2Id, 'Workspace IDs are unique and distinct');

    // 3. User 1 Mutates Workspace 1 State
    console.log('\nStep 3: Mutating User 1 Workspace Data...');
    db.updateWorkspaceData(ws1Id, prev => ({
      ...prev,
      businessSetup: {
        ...prev.businessSetup,
        keywords: ['LuxurySilk', 'JamdaniHeritage', 'DhakaCouture'],
        products: 'Jamdani silk scarves',
        goals: 'Reach more local customers'
      },
      businessBrain: {
        ...prev.businessBrain,
        elevatorPitch: 'Dhaka Elegance produces heirloom Jamdani silk for royal weddings.'
      },
      memoryLogs: [
        {
          id: 'log-alice-1',
          timestamp: new Date().toISOString(),
          type: 'strategy',
          note: 'Alice approved winter bridal collection launch.'
        }
      ]
    }));

    const ws1Data = db.getWorkspaceData(ws1Id);
    assert(
      ws1Data?.businessSetup.keywords.includes('LuxurySilk') === true,
      'User 1 workspace successfully stored custom keywords'
    );
    assert(
      ws1Data?.memoryLogs.some(l => l.note.includes('Alice approved winter bridal')) === true,
      'User 1 workspace successfully stored custom memory log'
    );
    assert(ws1Data?.businessSetup.products === 'Jamdani silk scarves', 'User 1 products are saved to their workspace');
    assert(ws1Data?.businessSetup.goals === 'Reach more local customers', 'User 1 goals are saved to their workspace');

    db.recordSuccessfulTrialAction(ws1Id, 'adviser');
    assert(db.getTrialSnapshot(ws1Id)?.actionsUsed === 1, 'Successful workspace AI action increments server-side trial usage');

    // 4. Verify User 2 CANNOT see User 1's Data (Zero Leakage)
    console.log('\nStep 4: Testing Data Isolation between Workspaces...');
    const ws2Data = db.getWorkspaceData(ws2Id);
    assert(
      !ws2Data?.businessSetup.keywords.includes('LuxurySilk'),
      'User 2 workspace DOES NOT contain User 1 keywords'
    );
    assert(
      !ws2Data?.memoryLogs.some(l => l.note.includes('Alice approved winter bridal')),
      'User 2 workspace DOES NOT contain User 1 memory logs'
    );
    assert(ws2Data?.businessSetup.products === '', 'User 2 workspace does not contain User 1 products');
    assert(ws2Data?.businessSetup.goals === '', 'User 2 workspace does not contain User 1 goals');
    assert(db.getTrialSnapshot(ws2Id)?.actionsUsed === 0, 'User 2 trial usage is separate from User 1');

    // 5. Verify Cross-Tenant Access Control (Server Authorization)
    console.log('\nStep 5: Verifying Server-Side Authorization Controls...');
    const user2Memberships = db.getWorkspacesForUser(user2Res.user.id);
    const user2CanAccessWs1 = user2Memberships.some(m => m.workspace.id === ws1Id);
    assert(
      user2CanAccessWs1 === false,
      'User 2 membership list does not include User 1 workspace'
    );

    const crossTenantMembership = db.getUserMembership(ws1Id, user2Res.user.id);
    assert(
      crossTenantMembership === null,
      'Direct cross-tenant membership lookup correctly returns null'
    );

    const user1ValidMembership = db.getUserMembership(ws1Id, user1Res.user.id);
    assert(
      user1ValidMembership?.role === 'owner',
      'User 1 has verified owner role on User 1 workspace'
    );

    // 6. Test Persistence Across Sessions (Logout and Re-login)
    console.log('\nStep 6: Verifying Persistence Across Sessions...');
    const loginRes = await authService.login(user1Email, 'Password123!');
    assert(!!loginRes.token, 'User 1 successfully re-authenticated with credentials');
    assert(loginRes.user.id === user1Res.user.id, 'User ID matches original account');

    const persistentWs1Data = db.getWorkspaceData(ws1Id);
    assert(
      persistentWs1Data?.businessBrain.elevatorPitch === 'Dhaka Elegance produces heirloom Jamdani silk for royal weddings.',
      'Elevator pitch persisted across logout and login'
    );
    assert(
      persistentWs1Data?.businessSetup.keywords.includes('JamdaniHeritage') === true,
      'Keywords persisted across logout and login'
    );

    console.log('\n====================================================');
    console.log(`TEST SUITE COMPLETE: ${passedTests}/${totalTests} TESTS PASSED`);
    console.log('Local JSON workspace isolation and persistence checks passed; PostgreSQL/RLS is not tested by this suite.');
    console.log('====================================================\n');
  } catch (err: any) {
    console.error('\nTEST SUITE FAILED:', err.message);
    process.exit(1);
  }
}

runTenantIsolationTests();
