export const getCombinedActiveAttacks = ({ activeTestAttack, activeAttacks = [] }) => {
  const attacks = [];
  const seenIds = new Set();

  const pushUnique = (attack) => {
    if (!attack || !attack.id || seenIds.has(attack.id)) return;
    seenIds.add(attack.id);
    attacks.push(attack);
  };

  if (Array.isArray(activeAttacks)) {
    activeAttacks.forEach(pushUnique);
  }

  if (activeTestAttack) {
    pushUnique(activeTestAttack);
  }

  return attacks;
};

export const getActiveAttackCount = ({ activeTestAttack, activeAttacks = [] }) =>
  getCombinedActiveAttacks({ activeTestAttack, activeAttacks }).length;
