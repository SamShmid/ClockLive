module.exports = {
  root: true,
  extends: ['expo', 'prettier'],
  env: { browser: true, node: true },
  rules: {
    // Legacy patterns in HourHand/MinuteHand/Context slated for the Phase 2/3
    // rewrites (see PROJECT_TASKS.md); demoted until those land.
    'react-hooks/refs': 'warn',
    'react-hooks/set-state-in-effect': 'warn',
  },
  ignorePatterns: ['node_modules/', 'android/', 'ios/', 'dist/', 'server/'],
};
