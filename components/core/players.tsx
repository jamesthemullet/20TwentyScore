const defaultPlayers = () => {
  return [
    {
      index: 0,
      name: 'Player 1',
      runs: 0,
      currentStriker: true,
      currentNonStriker: false,
      isOut: false,
      allActions: [],
      onTheCrease: true,
      status: 'Not out'
    },
    {
      index: 1,
      name: 'Player 2',
      runs: 0,
      currentStriker: false,
      currentNonStriker: true,
      isOut: false,
      allActions: [],
      onTheCrease: true,
      status: 'Not out'
    },
    {
      index: 2,
      name: 'Player 3',
      runs: 0,
      currentStriker: false,
      currentNonStriker: false,
      isOut: false,
      allActions: [],
      onTheCrease: false,
      status: 'Not out'
    },
    {
      index: 3,
      name: 'Player 4',
      runs: 0,
      currentStriker: false,
      currentNonStriker: false,
      isOut: false,
      allActions: [],
      onTheCrease: false,
      status: 'Not out'
    },
    {
      index: 4,
      name: 'Player 5',
      runs: 0,
      currentStriker: false,
      currentNonStriker: false,
      isOut: false,
      allActions: [],
      onTheCrease: false,
      status: 'Not out'
    },
    {
      index: 5,
      name: 'Player 6',
      runs: 0,
      currentStriker: false,
      currentNonStriker: false,
      isOut: false,
      allActions: [],
      onTheCrease: false,
      status: 'Not out'
    },
    {
      index: 6,
      name: 'Player 7',
      runs: 0,
      currentStriker: false,
      currentNonStriker: false,
      isOut: false,
      allActions: [],
      onTheCrease: false,
      status: 'Not out'
    },
    {
      index: 7,
      name: 'Player 8',
      runs: 0,
      currentStriker: false,
      currentNonStriker: false,
      isOut: false,
      allActions: [],
      onTheCrease: false,
      status: 'Not out'
    },
    {
      index: 8,
      name: 'Player 9',
      runs: 0,
      currentStriker: false,
      currentNonStriker: false,
      isOut: false,
      allActions: [],
      onTheCrease: false,
      status: 'Not out'
    },
    {
      index: 9,
      name: 'Player 10',
      runs: 0,
      currentStriker: false,
      currentNonStriker: false,
      isOut: false,
      allActions: [],
      onTheCrease: false,
      status: 'Not out'
    },
    {
      index: 10,
      name: 'Player 11',
      runs: 0,
      currentStriker: false,
      currentNonStriker: false,
      isOut: false,
      allActions: [],
      onTheCrease: false,
      status: 'Not out'
    }
  ];
};

export default defaultPlayers;
