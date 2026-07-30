// 演示绘本数据 — 匹配原型结构
export interface Character {
  id: string;
  name: string;
  type: 'animal' | 'object';
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

export const bookData: BookPageData[] = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1589182373814-fd19ba71c5ec?q=80&w=1000&auto=format&fit=crop",
    originalText: "小兔子在森林里发现了一个大蘑菇。",
    expandedText: "阳光透过树叶洒在草地上，活泼可爱的小兔子蹦蹦跳跳地来到了森林深处。突然，她停下了脚步，哇！眼前竟然出现了一个像小伞一样的大蘑菇，上面还长着漂亮的红色斑点呢！小兔子好奇地凑过去，闻了闻泥土的清香。",
    characters: [
      {
        id: "c1",
        name: "小白兔",
        type: "animal",
        position: { top: '40%', left: '20%', width: '30%', height: '40%' },
        persona: "我是一只聪明活泼的小兔子，喜欢吃胡萝卜，对世界充满好奇！",
        encyclopedia: "兔子是哺乳类兔形目动物，它们有长长的耳朵，听觉非常灵敏，而且跑得很快哦！",
        avatar: "🐰",
      },
      {
        id: "c2",
        name: "神奇蘑菇",
        type: "object",
        position: { top: '50%', left: '60%', width: '25%', height: '35%' },
        persona: "我是森林里的魔法蘑菇，虽然不会动，但我知道很多森林里的秘密。",
        encyclopedia: "蘑菇不是植物哦，它们属于真菌。有些蘑菇非常美味，但有些颜色鲜艳的蘑菇是有毒的，小朋友在野外千万不要随便采摘！",
        avatar: "🍄",
      },
    ],
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1598755257130-c2aaca1f061c?q=80&w=1000&auto=format&fit=crop",
    originalText: "大熊也来了，他们决定一起分享。",
    expandedText: "这时候，踩着沉重脚步的憨厚大熊也走过来了。\u201C好香的蘑菇呀！\u201D大熊摸了摸肚子说。小兔子看着大熊，微笑着说：\u201C大熊哥哥，我们一起分享这个大蘑菇吧！\u201D于是，两个好朋友坐在草地上，开心地聊起了天。",
    characters: [
      {
        id: "c1",
        name: "小白兔",
        type: "animal",
        position: { top: '45%', left: '15%', width: '25%', height: '35%' },
        persona: "我是一只聪明活泼的小兔子，喜欢分享！",
        encyclopedia: "兔子喜欢群居，它们用肢体语言交流，比如跺脚表示警告哦！",
        avatar: "🐰",
      },
      {
        id: "c3",
        name: "大熊",
        type: "animal",
        position: { top: '25%', left: '50%', width: '40%', height: '60%' },
        persona: "我是憨厚老实的大熊，最喜欢吃蜂蜜和交朋友。说话总是慢吞吞的。",
        encyclopedia: "熊是杂食性动物，有些熊在冬天会进行冬眠，睡上好几个月不吃不喝呢！",
        avatar: "🐻",
      },
    ],
  },
];

export const summaryData = {
  moral: "小朋友们，今天的故事告诉我们，学会分享是一件非常快乐的事情。当我们把美好的东西和好朋友一起分享时，快乐就会变成双倍哦！",
  question: "你在幼儿园或者家里，有没有和好朋友分享过什么好东西呢？快大声告诉小度吧！",
};
