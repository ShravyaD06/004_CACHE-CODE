import { Settings2 } from 'lucide-react';
import { missingConfigKeys } from '../lib/firebase';

export function SetupNotice() {
  return (
    <div className="setup-notice" role="alert">
      <div className="setup-notice__title">
        <Settings2 size={18} aria-hidden="true" />
        <strong>Firebase is not configured yet</strong>
      </div>
      <p>
        Sign-in is turned off until the app has your Firebase project settings. Copy <code>.env.example</code> to{' '}
        <code>.env</code>, fill in these values, then restart the dev server:
      </p>
      <ul>
        {missingConfigKeys.map((key) => (
          <li key={key}>
            <code>{key}</code>
          </li>
        ))}
      </ul>
      <p>The README walks through creating the project and enabling each sign-in method.</p>
    </div>
  );
}
