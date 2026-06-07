import { permanentRedirect } from 'next/navigation';

export default function FreeAiVisibilityTestRedirect() {
  permanentRedirect('/intake/?utm_source=site&utm_medium=redirect&utm_campaign=free-ai-visibility-test');
}
