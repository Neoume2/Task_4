import { fireEvent, screen, waitFor } from '@testing-library/react';
import { Routes, Route } from 'react-router-dom';

import AllPerks from '../src/pages/AllPerks.jsx';
import { renderWithRouter } from './utils/renderWithRouter.js';


  

describe('AllPerks page (Directory)', () => {
  test('lists public perks and responds to name filtering', async () => {
    // The seeded record gives us a deterministic expectation regardless of the
    // rest of the shared database contents.
    const seededPerk = global.__TEST_CONTEXT__.seededPerk;

    // Render the exploration page so it performs its real HTTP fetch.
    renderWithRouter(
      <Routes>
        <Route path="/explore" element={<AllPerks />} />
      </Routes>,
      { initialEntries: ['/explore'] }
    );

    // Wait for the baseline card to appear which guarantees the asynchronous
    // fetch finished.
    await waitFor(() => {
      expect(screen.getByText(seededPerk.title)).toBeInTheDocument();
    });

    // Interact with the name filter input using the real value that
    // corresponds to the seeded record.
    const nameFilter = screen.getByPlaceholderText('Enter perk name...');
    fireEvent.change(nameFilter, { target: { value: seededPerk.title } });

    await waitFor(() => {
      expect(screen.getByText(seededPerk.title)).toBeInTheDocument();
    });

    // The summary text should continue to reflect the number of matching perks.
    expect(screen.getByText(/showing/i)).toHaveTextContent('Showing');
  });

  /*
  TODO: Test merchant filtering
  - use the seeded record
  - perform a real HTTP fetch.
  - wait for the fetch to finish
  - choose the record's merchant from the dropdown
  - verify the record is displayed
  - verify the summary text reflects the number of matching perks
  */

  test('lists public perks and responds to merchant filtering', async () => {
    const seededPerk = global.__TEST_CONTEXT__.seededPerk;
    const merchantName = seededPerk.merchant;

    // Ensure the backend actually has the seeded perk before rendering the UI.
    // Sometimes the seed request and the UI test race; poll the API until present.
    await waitFor(async () => {
      const resp = await global.__TEST_CONTEXT__.api.get('/perks/all');
      const found = resp.data.perks.some(p => p._id === seededPerk._id || p.title === seededPerk.title);
      expect(found).toBe(true);
    }, { timeout: 10000 });

    // Now render the page which will perform its own fetch.
    renderWithRouter(
      <Routes>
        <Route path="/explore" element={<AllPerks />} />
      </Routes>,
      { initialEntries: ['/explore'] }
    );

    // Wait for the seeded card to appear in the UI
    await waitFor(() => expect(screen.getByText(seededPerk.title)).toBeInTheDocument(), { timeout: 10000 });

  // Find the merchant <select> by locating its option and traversing to the parent <select>.
  // This is robust even if the select has no label association.
  const allOption = screen.getByText('All Merchants');
  const merchantSelect = allOption.closest('select');
  expect(merchantSelect).toBeTruthy();

  // Apply the merchant filter and wait for the UI to update
  fireEvent.change(merchantSelect, { target: { value: merchantName } });

    await waitFor(() => expect(screen.getByText(seededPerk.title)).toBeInTheDocument(), { timeout: 5000 });
    expect(screen.getByText(/showing/i)).toHaveTextContent('Showing');
  });
});
