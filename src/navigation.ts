export type Tab = 'board' | 'history' | 'settings';
export type Modal = 'new' | 'help' | 'cards' | 'calls' | 'names' | 'menu' | 'clear-history';
export type Navigation = { tabs: Tab[]; modals: Modal[] };
export type NavigationAction =
  | { type: 'tab'; tab: Tab }
  | { type: 'modal'; modal: Modal | null }
  | { type: 'back' };

export const initialNavigation: Navigation = { tabs: ['board'], modals: [] };

export function navigate(state: Navigation, action: NavigationAction): Navigation {
  if (action.type === 'tab') {
    return {
      tabs: state.tabs.at(-1) === action.tab ? state.tabs : [...state.tabs, action.tab],
      modals: [],
    };
  }
  if (action.type === 'modal') {
    if (action.modal === null) return { ...state, modals: [] };
    const existing = state.modals.indexOf(action.modal);
    return {
      ...state,
      modals: existing < 0
        ? [...state.modals, action.modal]
        : state.modals.slice(0, existing + 1),
    };
  }
  if (state.modals.length) return { ...state, modals: state.modals.slice(0, -1) };
  if (state.tabs.length > 1) return { ...state, tabs: state.tabs.slice(0, -1) };
  // At the initial board, Back must not close the app.
  return state;
}
