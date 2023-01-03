import { RobotRedford } from './RobotRedfordEvents';

declare global {
  interface Window {
    RobotRedford: typeof RobotRedford;
  }
}

window.RobotRedford = RobotRedford;
