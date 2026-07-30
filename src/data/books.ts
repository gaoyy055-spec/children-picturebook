// 绘本数据 — 书架用

export interface Character {
  id: string;
  name: string;
  type: 'animal' | 'object' | 'background';
  position: { top: string; left: string; width: string; height: string };
  persona: string;
  encyclopedia: string;
  avatar: string;
  arModelUrl?: string;
}

export interface BookPageData {
  id: number;
  image: string;
  originalText: string;
  expandedText: string;
  characters: Character[];
}

export interface BookMeta {
  bookId: string;
  title: string;
  cover: string;
  description: string;
  emoji: string;
  pages: BookPageData[];
  isUploaded: boolean;
  createdAt: number;
}

// ===== 内置绘本 =====

const book1: BookMeta = {
  bookId: 'rabbit-mushroom',
  title: '小兔子与大蘑菇',
  cover: 'https://images.unsplash.com/photo-1589182373814-fd19ba71c5ec?q=80&w=600&auto=format&fit=crop',
  description: '小兔子在森林里发现了一个神奇的大蘑菇，还交到了新朋友！',
  emoji: '🐰',
  isUploaded: false,
  createdAt: Date.now(),
  pages: [
    {
      id: 1,
      image: 'https://images.unsplash.com/photo-1589182373814-fd19ba71c5ec?q=80&w=1000&auto=format&fit=crop',
      originalText: '小兔子在森林里发现了一个大蘑菇。',
      expandedText: '阳光透过树叶洒在草地上，活泼可爱的小兔子蹦蹦跳跳地来到了森林深处。突然，她停下了脚步，哇！眼前竟然出现了一个像小伞一样的大蘑菇，上面还长着漂亮的红色斑点呢！小兔子好奇地凑过去，闻了闻泥土的清香。',
      characters: [
        { id: 'c1', name: '小白兔', type: 'animal', position: { top: '40%', left: '20%', width: '30%', height: '40%' }, persona: '我是一只聪明活泼的小兔子，喜欢吃胡萝卜，对世界充满好奇！', encyclopedia: '兔子是哺乳类兔形目动物，它们有长长的耳朵，听觉非常灵敏，而且跑得很快哦！', avatar: '🐰' },
        { id: 'c2', name: '神奇蘑菇', type: 'object', position: { top: '50%', left: '60%', width: '25%', height: '35%' }, persona: '我是森林里的魔法蘑菇，虽然不会动，但我知道很多森林里的秘密。', encyclopedia: '蘑菇不是植物哦，它们属于真菌。有些蘑菇非常美味，但有些颜色鲜艳的蘑菇是有毒的，小朋友在野外千万不要随便采摘！', avatar: '🍄' },
      ],
    },
    {
      id: 2,
      image: 'https://images.unsplash.com/photo-1598755257130-c2aaca1f061c?q=80&w=1000&auto=format&fit=crop',
      originalText: '大熊也来了，他们决定一起分享。',
      expandedText: '这时候，踩着沉重脚步的憨厚大熊也走过来了。\u201C好香的蘑菇呀！\u201D大熊摸了摸肚子说。小兔子看着大熊，微笑着说：\u201C大熊哥哥，我们一起分享这个大蘑菇吧！\u201D于是，两个好朋友坐在草地上，开心地聊起了天。',
      characters: [
        { id: 'c1', name: '小白兔', type: 'animal', position: { top: '45%', left: '15%', width: '25%', height: '35%' }, persona: '我是一只聪明活泼的小兔子，喜欢分享！', encyclopedia: '兔子喜欢群居，它们用肢体语言交流，比如跺脚表示警告哦！', avatar: '🐰' },
        { id: 'c3', name: '大熊', type: 'animal', position: { top: '25%', left: '50%', width: '40%', height: '60%' }, persona: '我是憨厚老实的大熊，最喜欢吃蜂蜜和交朋友。说话总是慢吞吞的。', encyclopedia: '熊是杂食性动物，有些熊在冬天会进行冬眠，睡上好几个月不吃不喝呢！', avatar: '🐻' },
      ],
    },
    {
      id: 3,
      image: 'https://images.unsplash.com/photo-1502082553048-f009c37129d9?q=80&w=1000&auto=format&fit=crop',
      originalText: '他们一起度过了一个快乐的下午，约定明天再来。',
      expandedText: '吃完蘑菇后，小兔子和大熊躺在草地上看天空。白云变成了棉花糖、变成了小兔子、变成了大熊的样子！\u201C哈哈哈，那朵云好像你！\u201D小兔子指着天空笑得前仰后合。太阳快要下山了，金色的光芒洒满了整个森林。\u201C明天我们还来，好不好？\u201D大熊问。\u201C好呀！\u201D小兔子开心地答应了。',
      characters: [
        { id: 'c1', name: '小白兔', type: 'animal', position: { top: '35%', left: '20%', width: '25%', height: '30%' }, persona: '今天真开心！和大熊在一起，什么都是好玩的！', encyclopedia: '兔子的后腿特别有力气，它们可以跳到两米多高呢！', avatar: '🐰' },
        { id: 'c3', name: '大熊', type: 'animal', position: { top: '30%', left: '50%', width: '35%', height: '50%' }, persona: '嘿嘿，和朋友们在一起，就是最幸福的事情了。', encyclopedia: '熊的嗅觉比狗还灵敏，它们能闻到很远很远的地方的食物香味！', avatar: '🐻' },
      ],
    },
  ],
};

const book2: BookMeta = {
  bookId: 'little-star',
  title: '小星星找朋友',
  cover: 'https://images.unsplash.com/photo-1519681393784-d1202679337a?q=80&w=600&auto=format&fit=crop',
  description: '天上的一颗小星星觉得好孤单，她决定出发去找朋友！',
  emoji: '⭐',
  isUploaded: false,
  createdAt: Date.now(),
  pages: [
    {
      id: 1,
      image: 'https://images.unsplash.com/photo-1519681393784-d1202679337a?q=80&w=1000&auto=format&fit=crop',
      originalText: '小星星在天上觉得很孤单。',
      expandedText: '夜深了，天空中亮起了好多好多星星。可是有一颗最小的星星，却怎么也开心不起来。她悄悄地对身边划过的风说：\u201C我好想有一个朋友啊，可以一起唱歌，一起讲故事。\u201D',
      characters: [
        { id: 'c1', name: '小星星', type: 'object', position: { top: '20%', left: '60%', width: '20%', height: '20%' }, persona: '我是天上最亮的小星星，虽然小小的，但我很勇敢！', encyclopedia: '星星其实是非常非常大的天体，只是因为离我们太远了，所以看起来很小很小哦！', avatar: '⭐' },
        { id: 'c2', name: '月亮姐姐', type: 'object', position: { top: '10%', left: '25%', width: '25%', height: '25%' }, persona: '我是温柔的月亮姐姐，总是照亮夜晚的天空。', encyclopedia: '月亮本身不会发光，我们看到的光是太阳光的反射哦！月亮也会变化形状，这叫做月相。', avatar: '🌙' },
      ],
    },
    {
      id: 2,
      image: 'https://images.unsplash.com/photo-1475274047050-1d0c55534771?q=80&w=1000&auto=format&fit=crop',
      originalText: '月亮姐姐帮小星星找到了好多朋友。',
      expandedText: '月亮姐姐听到了小星星的心愿，温柔地笑了：\u201C小星星，你看看周围，其实你从来都不孤单呢！\u201D月亮姐姐用银色的光芒一照，哇！天空突然变得热闹极了，原来每一颗星星都醒了过来，对着小星星眨眼睛呢！\u201C我们来做好朋友吧！\u201D大家一齐说。',
      characters: [
        { id: 'c1', name: '小星星', type: 'object', position: { top: '30%', left: '55%', width: '18%', height: '18%' }, persona: '我找到朋友啦！原来好朋友一直就在我身边！', encyclopedia: '星星和星星之间离得非常非常远，即使看起来挨在一起，其实中间可能隔着好多光年的距离呢！', avatar: '⭐' },
        { id: 'c2', name: '月亮姐姐', type: 'object', position: { top: '15%', left: '20%', width: '22%', height: '22%' }, persona: '我帮助小星星找到了朋友，我也很开心！', encyclopedia: '月亮和地球之间大约有38万公里的距离，光从月亮走到地球大约需要1.3秒！', avatar: '🌙' },
      ],
    },
    {
      id: 3,
      image: 'https://images.unsplash.com/photo-1507400492013-162706c8c05e?q=80&w=1000&auto=format&fit=crop',
      originalText: '小星星再也不孤单了，她和朋友们一起唱起了歌。',
      expandedText: '从那以后，每天晚上小星星都和她的朋友们一起做游戏。她们手拉手，在夜空中画出了最美丽的星座图案——有的像小熊，有的像天鹅，还有的像一把大大的勺子！\u201C原来快乐一直都在我身边呀！\u201D小星星开心地唱起了歌，整片天空都亮了起来。',
      characters: [
        { id: 'c1', name: '小星星', type: 'object', position: { top: '25%', left: '40%', width: '20%', height: '20%' }, persona: '我现在有好多好多朋友啦！每天晚上都好开心！', encyclopedia: '天空中最亮的恒星是天狼星，它的光要花8年多才能到达地球呢！', avatar: '⭐' },
        { id: 'c3', name: '流星弟弟', type: 'object', position: { top: '15%', left: '65%', width: '22%', height: '18%' }, persona: '我是跑得最快的流星弟弟！我喜欢给大家表演划过天空的魔术！', encyclopedia: '流星其实是从太空飞来的小石子，它们冲进地球大气层时因为摩擦发热才发光的！', avatar: '☄️' },
      ],
    },
  ],
};

const book3: BookMeta = {
  bookId: 'brave-train',
  title: '勇敢的小火车',
  cover: 'https://images.unsplash.com/photo-1474181487882-5abf3f0ba6c3?q=80&w=600&auto=format&fit=crop',
  description: '一列小火车要翻过好高的山，她能成功吗？',
  emoji: '🚂',
  isUploaded: false,
  createdAt: Date.now(),
  pages: [
    {
      id: 1,
      image: 'https://images.unsplash.com/photo-1474181487882-5abf3f0ba6c3?q=80&w=1000&auto=format&fit=crop',
      originalText: '小火车要翻过一座很高很高的山。',
      expandedText: '呜——呜——小火车拉响了汽笛，她要翻过前面那座好高好高的大山。山上的云雾把山顶都藏了起来，看起来好可怕呀！可是小火车咬了咬牙：\u201C我一定能行的！\u201D她呼哧呼哧地爬上了第一个山坡。',
      characters: [
        { id: 'c1', name: '小火车', type: 'object', position: { top: '55%', left: '10%', width: '35%', height: '30%' }, persona: '我是勇敢的小火车，虽然我个子小，但我从来不放弃！呜呜！', encyclopedia: '火车最早是用蒸汽做动力的，需要烧煤炭把水烧开变成蒸汽，才能让火车跑起来哦！', avatar: '🚂' },
        { id: 'c2', name: '大山', type: 'object', position: { top: '10%', left: '40%', width: '40%', height: '60%' }, persona: '我是沉默的大山，看起来很高很吓人，但其实我对每个勇敢的旅客都很温柔。', encyclopedia: '世界上最高的山是珠穆朗玛峰，有8848米那么高！可是爬山的人们都很勇敢，一步一步就爬上去了！', avatar: '⛰️' },
      ],
    },
    {
      id: 2,
      image: 'https://images.unsplash.com/photo-1504198453319-5ce911b1de35?q=80&w=1000&auto=format&fit=crop',
      originalText: '小火车终于翻过了大山，看到了美丽的风景！',
      expandedText: '经过了好久好久的攀爬，小火车终于翻过了山顶！当她探出头的那一刻，眼前的风景美极了——彩虹弯弯地挂在天上，绿油油的草地上开满了鲜花，小鸟们在欢快地飞来飞去。\u201C太美了！\u201D小火车高兴地叫了起来，\u201C原来只要不放弃，就能看到最美的风景！\u201D',
      characters: [
        { id: 'c1', name: '小火车', type: 'object', position: { top: '50%', left: '15%', width: '30%', height: '25%' }, persona: '我翻过大山啦！只要勇敢不放弃，什么都能做到！', encyclopedia: '现在的火车有高铁，最快可以跑到每小时350公里，比风还快呢！', avatar: '🚂' },
        { id: 'c2', name: '彩虹', type: 'object', position: { top: '5%', left: '30%', width: '40%', height: '25%' }, persona: '我是美丽的彩虹，每次雨后天晴我就会出来和小朋友们打招呼！', encyclopedia: '彩虹其实有7种颜色：红橙黄绿青蓝紫。它是阳光穿过小雨滴折射形成的哦！', avatar: '🌈' },
      ],
    },
    {
      id: 3,
      image: 'https://images.unsplash.com/photo-1498257443956-7dc9e0f13976?q=80&w=1000&auto=format&fit=crop',
      originalText: '小火车把山那边的花带到了山这边，大家都好开心！',
      expandedText: '小火车到了山那边以后，发现了一种从没见过的漂亮小花。她想：\u201C我要把这份美丽带回去，和大家一起分享！\u201D于是她在车厢里装满了花籽，呼哧呼哧地又翻过了大山。山这边的朋友们看到花籽都好惊喜！\u201C小火车，你真了不起！\u201D大家欢呼着。第二年春天，大山两边都开满了美丽的花。',
      characters: [
        { id: 'c1', name: '小火车', type: 'object', position: { top: '45%', left: '20%', width: '35%', height: '28%' }, persona: '我不仅翻过了大山，还把快乐带到了更多的地方！呜呜～', encyclopedia: '最早的铁路出现在200多年前的英国，那时的火车还没有汽车跑得快呢！', avatar: '🚂' },
        { id: 'c3', name: '花仙子', type: 'object', position: { top: '25%', left: '55%', width: '22%', height: '28%' }, persona: '我是花仙子，谢谢小火车把我的花籽带给了更多的朋友！', encyclopedia: '向日葵总是朝着太阳的方向转动，因为它们喜欢阳光，这种现象叫向光性哦！', avatar: '🌸' },
      ],
    },
  ],
};

const book4: BookMeta = {
  bookId: 'ocean-adventure',
  title: '海底探险记',
  cover: 'https://images.unsplash.com/photo-1583212292454-1fe6229603b3?q=80&w=600&auto=format&fit=crop',
  description: '小海龟第一次离开珊瑚礁，踏上了海底探险之旅！',
  emoji: '🐢',
  isUploaded: false,
  createdAt: Date.now(),
  pages: [
    {
      id: 1,
      image: 'https://images.unsplash.com/photo-1583212292454-1fe6229603b3?q=80&w=1000&auto=format&fit=crop',
      originalText: '小海龟出发去海底探险了。',
      expandedText: '在一片五彩斑斓的珊瑚礁里，住着一只刚出生不久的小海龟。他每天都望着蓝色的大海，心想：\u201C外面的大海里都有些什么呢？\u201D终于有一天，他鼓起勇气，摇摇小尾巴，朝着深蓝色的大海游去了！',
      characters: [
        { id: 'c1', name: '小海龟', type: 'animal', position: { top: '40%', left: '20%', width: '25%', height: '30%' }, persona: '我是勇敢的小海龟，虽然游得慢，但我从不迷路！', encyclopedia: '海龟是一种非常长寿的动物，有些海龟可以活到100岁以上呢！它们还能在海洋里游好几千公里！', avatar: '🐢' },
        { id: 'c2', name: '珊瑚妈妈', type: 'object', position: { top: '55%', left: '55%', width: '30%', height: '30%' }, persona: '我是保护小鱼的珊瑚妈妈，我的身体里住着好多好多小生物。', encyclopedia: '珊瑚其实不是石头，也不是植物，它们是小小的海洋动物聚集在一起形成的！珊瑚礁被称为\u201C海底的雨林\u201D哦！', avatar: '🪸' },
      ],
    },
    {
      id: 2,
      image: 'https://images.unsplash.com/photo-1544551763-464f8b079029?q=80&w=1000&auto=format&fit=crop',
      originalText: '小海龟交到了新朋友，海底真有趣！',
      expandedText: '小海龟越游越远，遇到了好多新朋友！一只透明的水母阿姨在跳舞，一群彩色的小丑鱼在珊瑚丛里捉迷藏，还有一只大海马爷爷慢悠悠地散步。\u201C海底世界真是太有趣了！\u201D小海龟开心极了，他决定把看到的每一个朋友都记在心里。',
      characters: [
        { id: 'c1', name: '小海龟', type: 'animal', position: { top: '35%', left: '15%', width: '20%', height: '25%' }, persona: '我交到了好多朋友！海底世界真精彩！', encyclopedia: '海龟妈妈会在沙滩上挖洞下蛋，小海龟孵出来后自己爬向大海，非常勇敢！', avatar: '🐢' },
        { id: 'c2', name: '水母阿姨', type: 'animal', position: { top: '15%', left: '50%', width: '25%', height: '30%' }, persona: '我是优雅的水母阿姨，最喜欢在海水里跳舞啦！', encyclopedia: '水母没有大脑也没有心脏，但它们在地球上已经生活了5亿多年了，比恐龙还要早呢！', avatar: '🪼' },
      ],
    },
    {
      id: 3,
      image: 'https://images.unsplash.com/photo-1546026103-443f0263305f?q=80&w=1000&auto=format&fit=crop',
      originalText: '小海龟带着朋友们回到了珊瑚礁，一起保护美丽的家。',
      expandedText: '探险结束后，小海龟带着新朋友们一起回到了珊瑚礁。\u201C这里就是我的家！\u201D小海龟骄傲地说。水母阿姨惊叹于珊瑚的美丽，小丑鱼们在珊瑚丛里找到了新家，海马爷爷也觉得这里好温暖。\u201C我们一起保护这个美丽的家吧！\u201D小海龟说。从此以后，珊瑚礁变得更加热闹了，每个小伙伴都觉得自己是这里的主人。',
      characters: [
        { id: 'c1', name: '小海龟', type: 'animal', position: { top: '40%', left: '20%', width: '22%', height: '28%' }, persona: '带朋友们回家是最棒的事情！我们的珊瑚礁是全世界最美的地方！', encyclopedia: '海龟可以通过地球磁场来导航，这就是它们能从几千公里外找到回家的路的原因！', avatar: '🐢' },
        { id: 'c3', name: '小丑鱼', type: 'animal', position: { top: '35%', left: '55%', width: '18%', height: '22%' }, persona: '我找到了新的家！珊瑚丛里好好玩呀，有好多地方可以捉迷藏！', encyclopedia: '小丑鱼和海葵是好朋友！海葵的毒刺不会伤害小丑鱼，反而会保护小丑鱼不被大鱼吃掉！', avatar: '🐠' },
      ],
    },
  ],
};

export const builtInBooks: BookMeta[] = [book1, book2, book3, book4];

export interface DefaultShelfBookSeed {
  bookId: string;
  title: string;
  pdfUrl: string;
  emoji: string;
}

export const defaultShelfBookSeeds: DefaultShelfBookSeed[] = [
  {
    bookId: 'wild-boar-bakery',
    title: '野猪面包店',
    pdfUrl: '/default-books/wild-boar-bakery.pdf',
    emoji: '🐗',
  },
  {
    bookId: 'little-coffee-bean-walk',
    title: '小啡豆周围走',
    pdfUrl: '/default-books/little-coffee-bean-walk.pdf',
    emoji: '☕',
  },
  {
    bookId: 'when-flowers-bloom',
    title: '花开的时候',
    pdfUrl: '/default-books/when-flowers-bloom.pdf',
    emoji: '🌸',
  },
];
