import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WorkoutCategory } from './entities/workout-category.entity';
import { WorkoutPlan } from './entities/workout-plan.entity';
import { WorkoutPhase, PhaseType } from './entities/workout-phase.entity';
import { Exercise } from './entities/exercise.entity';

interface ExerciseInput {
  name: string;
  description: string;
  duration?: number;
  sets?: number;
  reps?: number;
}

interface PhaseInput {
  phase: { name: string; type: PhaseType; sortOrder: number; duration: number };
  exercises: ExerciseInput[];
}

interface PlanInput {
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: number;
  caloriesBurned: number;
}

@Injectable()
export class WorkoutSeedService implements OnModuleInit {
  private readonly logger = new Logger(WorkoutSeedService.name);

  constructor(
    @InjectRepository(WorkoutCategory) private readonly categoryRepo: Repository<WorkoutCategory>,
    @InjectRepository(WorkoutPlan) private readonly planRepo: Repository<WorkoutPlan>,
    @InjectRepository(WorkoutPhase) private readonly phaseRepo: Repository<WorkoutPhase>,
    @InjectRepository(Exercise) private readonly exerciseRepo: Repository<Exercise>,
  ) {}

  async onModuleInit() {
    const count = await this.categoryRepo.count();
    if (count > 0) { this.logger.log('Workout data already seeded, skipping'); return; }
    this.logger.log('Seeding workout data...');
    await this.seed();
    this.logger.log('Workout data seeded successfully');
  }

  private async seedPlan(
    categoryId: string,
    plan: PlanInput,
    phases: PhaseInput[],
  ) {
    const savedPlan = await this.planRepo.save({ categoryId, ...plan } as any);
    for (const p of phases) {
      const savedPhase = await this.phaseRepo.save({ planId: savedPlan.id, ...p.phase });
      await this.exerciseRepo.save(
        p.exercises.map((e, i) => ({ phaseId: savedPhase.id, sortOrder: i, ...e })),
      );
    }
  }

  private async seed() {
    const categories = await this.categoryRepo.save([
      { name: '跑步', icon: '🏃', description: '有氧跑步训练，提升心肺功能与耐力', sortOrder: 1 },
      { name: '瑜伽', icon: '🧘', description: '瑜伽与柔韧性训练，身心合一', sortOrder: 2 },
      { name: '力量', icon: '💪', description: '力量训练，塑造强健体魄', sortOrder: 3 },
      { name: '拉伸', icon: '🤸', description: '拉伸与灵活性训练，缓解疲劳', sortOrder: 4 },
      { name: 'HIIT', icon: '🔥', description: '高强度间歇训练，高效燃脂', sortOrder: 5 },
    ]);

    // ==================== 跑步 ====================
    await this.seedPlan(categories[0].id, {
      title: '入门慢跑30分钟',
      description: '适合跑步新手的轻松慢跑计划，包含充分的热身和放松环节',
      difficulty: 'beginner',
      duration: 30,
      caloriesBurned: 250,
    }, [
      {
        phase: { name: '热身活动', type: PhaseType.WARMUP, sortOrder: 0, duration: 5 },
        exercises: [
          { name: '颈部环绕', description: '缓慢转动头部，顺时针和逆时针各5圈', duration: 30 },
          { name: '手臂环绕', description: '双臂向前和向后画圈，激活肩关节', duration: 30 },
          { name: '腿部动态拉伸', description: '前后摆腿，活动髋关节和大腿肌群', duration: 60 },
          { name: '踝关节旋转', description: '单脚站立，旋转脚踝各方向，预防扭伤', duration: 30 },
        ],
      },
      {
        phase: { name: '慢跑训练', type: PhaseType.MAIN, sortOrder: 1, duration: 20 },
        exercises: [
          { name: '快走热身', description: '以较快步速行走，逐步提高心率', duration: 180 },
          { name: '轻松慢跑', description: '保持舒适配速，能正常说话的强度', duration: 600 },
          { name: '步行恢复', description: '放慢速度走路，调整呼吸', duration: 120 },
          { name: '慢跑巩固', description: '再次以轻松配速慢跑，注意呼吸节奏', duration: 300 },
        ],
      },
      {
        phase: { name: '放松拉伸', type: PhaseType.COOLDOWN, sortOrder: 2, duration: 5 },
        exercises: [
          { name: '股四头肌拉伸', description: '单脚站立，手拉同侧脚踝贴近臀部，每侧保持30秒', duration: 60 },
          { name: '小腿拉伸', description: '面墙弓步，后脚跟紧贴地面，拉伸腓肠肌', duration: 60 },
          { name: '深呼吸放松', description: '双手叉腰，缓慢深呼吸，恢复平静心率', duration: 60 },
        ],
      },
    ]);

    await this.seedPlan(categories[0].id, {
      title: '进阶间歇跑40分钟',
      description: '通过快慢交替跑提升速度和耐力，适合有一定跑步基础的跑者',
      difficulty: 'intermediate',
      duration: 40,
      caloriesBurned: 400,
    }, [
      {
        phase: { name: '动态热身', type: PhaseType.WARMUP, sortOrder: 0, duration: 8 },
        exercises: [
          { name: '原地高抬腿', description: '快速交替抬腿至腰部高度，激活核心和腿部', duration: 60 },
          { name: '开合跳', description: '双脚开合跳跃，同时双臂上下摆动', duration: 60 },
          { name: '弓步行走', description: '大步向前迈出弓步，交替前进，活动髋屈肌', duration: 90 },
          { name: '慢跑热身', description: '以轻松配速慢跑，逐步提升体温', duration: 180 },
        ],
      },
      {
        phase: { name: '间歇跑训练', type: PhaseType.MAIN, sortOrder: 1, duration: 26 },
        exercises: [
          { name: '中速跑', description: '以中等配速稳定跑步，建立节奏', duration: 300 },
          { name: '加速冲刺', description: '提高至85%最大心率的速度冲刺', duration: 60 },
          { name: '慢跑恢复', description: '放慢配速，调整呼吸，准备下一组', duration: 120 },
          { name: '加速冲刺', description: '再次提速冲刺，保持良好跑姿', duration: 60 },
          { name: '慢跑恢复', description: '降低速度恢复，保持移动不要停下', duration: 120 },
          { name: '稳速巡航跑', description: '以舒适但略有挑战的配速持续跑', duration: 600 },
        ],
      },
      {
        phase: { name: '整理放松', type: PhaseType.COOLDOWN, sortOrder: 2, duration: 6 },
        exercises: [
          { name: '慢走放松', description: '逐渐降低速度至步行，平缓心率', duration: 120 },
          { name: '髂胫束拉伸', description: '交叉腿侧弯，拉伸大腿外侧', duration: 60 },
          { name: '腘绳肌拉伸', description: '坐姿前屈，双手尽量触碰脚尖', duration: 60 },
        ],
      },
    ]);

    await this.seedPlan(categories[0].id, {
      title: '高强度冲刺训练50分钟',
      description: '挑战速度极限的高强度冲刺训练，适合经验丰富的跑者',
      difficulty: 'advanced',
      duration: 50,
      caloriesBurned: 550,
    }, [
      {
        phase: { name: '充分热身', type: PhaseType.WARMUP, sortOrder: 0, duration: 10 },
        exercises: [
          { name: '慢跑热身', description: '以轻松配速跑步5分钟，提升体温', duration: 300 },
          { name: '动态腿部摆动', description: '前后左右摆腿，充分活动髋关节', duration: 60 },
          { name: '加速跑', description: '逐渐加速至中高速度，连续3次50米', duration: 90 },
          { name: '跨步跳', description: '大幅度跨步跳跃，激活臀部和腿部爆发力', duration: 60 },
        ],
      },
      {
        phase: { name: '冲刺训练', type: PhaseType.MAIN, sortOrder: 1, duration: 32 },
        exercises: [
          { name: '400米冲刺', description: '以90%最大心率冲刺400米', duration: 90 },
          { name: '慢跑恢复', description: '慢跑200米恢复', duration: 90 },
          { name: '400米冲刺', description: '保持高强度再次冲刺400米', duration: 90 },
          { name: '慢跑恢复', description: '慢跑恢复，调整呼吸节奏', duration: 90 },
          { name: '800米节奏跑', description: '以乳酸阈值配速跑800米', duration: 240 },
          { name: '步行恢复', description: '步行恢复2分钟', duration: 120 },
        ],
      },
      {
        phase: { name: '深度放松', type: PhaseType.COOLDOWN, sortOrder: 2, duration: 8 },
        exercises: [
          { name: '慢走放松', description: '逐渐将心率降至正常水平', duration: 180 },
          { name: '全身拉伸', description: '依次拉伸小腿、大腿、髋部、腰背', duration: 120 },
          { name: '泡沫轴放松', description: '使用泡沫轴滚压腿部肌群，缓解紧张', duration: 120 },
        ],
      },
    ]);

    // ==================== 瑜伽 ====================
    await this.seedPlan(categories[1].id, {
      title: '晨间唤醒瑜伽',
      description: '温和的晨间瑜伽序列，唤醒身体，开启活力满满的一天',
      difficulty: 'beginner',
      duration: 20,
      caloriesBurned: 120,
    }, [
      {
        phase: { name: '呼吸冥想', type: PhaseType.WARMUP, sortOrder: 0, duration: 3 },
        exercises: [
          { name: '腹式深呼吸', description: '盘坐，双手放腹部，吸气鼓腹呼气收腹，感受气息流动', duration: 60 },
          { name: '猫牛式', description: '四足跪姿，吸气抬头塌腰，呼气含胸弓背，灵活脊柱', duration: 60 },
          { name: '婴儿式', description: '臀部坐向脚跟，双臂前伸，额头触地，放松背部', duration: 60 },
        ],
      },
      {
        phase: { name: '拜日式序列', type: PhaseType.MAIN, sortOrder: 1, duration: 14 },
        exercises: [
          { name: '山式站立', description: '双脚并拢站直，双臂自然下垂，感受身体中正', duration: 60 },
          { name: '举臂前屈', description: '吸气双臂上举，呼气折叠前屈，手指触地', duration: 90 },
          { name: '下犬式', description: '双手双脚撑地，臀部上推成倒V形，拉伸后侧链', duration: 120 },
          { name: '战士一式', description: '弓步站立，双臂上举，髋部正对前方', duration: 120 },
          { name: '战士二式', description: '双腿大开，前腿屈膝，双臂水平展开', duration: 120 },
          { name: '树式平衡', description: '单脚站立，另一脚踩在大腿内侧，双手合十', duration: 120 },
        ],
      },
      {
        phase: { name: '放松收功', type: PhaseType.COOLDOWN, sortOrder: 2, duration: 3 },
        exercises: [
          { name: '仰卧扭转', description: '仰卧双膝倒向一侧，拉伸腰部和脊柱', duration: 90 },
          { name: '摊尸式', description: '仰卧放松全身，闭眼感受呼吸，进入深度放松', duration: 90 },
        ],
      },
    ]);

    await this.seedPlan(categories[1].id, {
      title: '流瑜伽进阶',
      description: '串联流动的瑜伽体式，在呼吸与动作中找到流动的力量',
      difficulty: 'intermediate',
      duration: 35,
      caloriesBurned: 200,
    }, [
      {
        phase: { name: '呼吸调息', type: PhaseType.WARMUP, sortOrder: 0, duration: 5 },
        exercises: [
          { name: '交替鼻孔呼吸', description: '用拇指和无名指交替按压鼻孔，平衡左右气脉', duration: 90 },
          { name: '猫牛式流动', description: '配合呼吸缓慢流动，唤醒脊柱每一节', duration: 60 },
          { name: '下犬式踏步', description: '在下犬式中交替屈膝踏步，活动腿部', duration: 90 },
        ],
      },
      {
        phase: { name: '流瑜伽序列', type: PhaseType.MAIN, sortOrder: 1, duration: 25 },
        exercises: [
          { name: '拜日式A三组', description: '完整拜日式A序列，配合呼吸流畅串联', duration: 300 },
          { name: '战士序列流动', description: '从战士一到战士二到侧角伸展，一气呵成', duration: 240 },
          { name: '半月式', description: '单腿站立侧展，另一腿水平伸展，锻炼平衡力', duration: 120 },
          { name: '鸽子式', description: '前腿屈膝置于身前，后腿伸直，深度开髋', duration: 180 },
          { name: '船式核心', description: '坐姿抬腿，身体成V形，激活核心稳定', duration: 90 },
        ],
      },
      {
        phase: { name: '深度放松', type: PhaseType.COOLDOWN, sortOrder: 2, duration: 5 },
        exercises: [
          { name: '坐姿前屈', description: '双腿伸直前屈，放松后背和腘绳肌', duration: 90 },
          { name: '仰卧束角式', description: '仰卧脚掌相对，双膝外展，放松髋部', duration: 90 },
          { name: '摊尸式冥想', description: '全身放松仰卧，进行身体扫描冥想', duration: 120 },
        ],
      },
    ]);

    await this.seedPlan(categories[1].id, {
      title: '力量瑜伽挑战',
      description: '融合力量与柔韧的高级瑜伽练习，挑战体能极限',
      difficulty: 'advanced',
      duration: 45,
      caloriesBurned: 300,
    }, [
      {
        phase: { name: '动态热身', type: PhaseType.WARMUP, sortOrder: 0, duration: 7 },
        exercises: [
          { name: '拜日式快速流动', description: '加快节奏的拜日式，提升心率和体温', duration: 180 },
          { name: '核心激活序列', description: '平板支撑到侧平板交替，唤醒核心', duration: 90 },
          { name: '深蹲式祈祷', description: '深蹲位双手合十，打开髋部和胸腔', duration: 60 },
          { name: '手倒立预备', description: '靠墙L形手倒立，建立肩部力量', duration: 90 },
        ],
      },
      {
        phase: { name: '力量瑜伽主体', type: PhaseType.MAIN, sortOrder: 1, duration: 32 },
        exercises: [
          { name: '瑜伽俯卧撑流动', description: '四柱支撑到上犬式到下犬式的力量流动', duration: 240 },
          { name: '椅子式脉冲', description: '保持椅子式姿势，微小幅度上下脉冲', duration: 120 },
          { name: '战士三式', description: '单腿站立前倾，身体和后腿成一条直线', duration: 180 },
          { name: '乌鸦式', description: '双手撑地，膝盖抵在上臂后侧，双脚离地', duration: 90 },
          { name: '轮式后弯', description: '仰卧推起全身成拱桥，深度后弯', duration: 120 },
          { name: '头倒立练习', description: '头和前臂支撑身体完全倒立，挑战平衡与力量', duration: 120 },
        ],
      },
      {
        phase: { name: '恢复冥想', type: PhaseType.COOLDOWN, sortOrder: 2, duration: 6 },
        exercises: [
          { name: '鸽子式深度放松', description: '在鸽子式中停留，深度释放髋部紧张', duration: 120 },
          { name: '仰卧脊柱扭转', description: '仰卧双膝左右扭转，释放脊柱张力', duration: 90 },
          { name: '瑜伽休息术', description: '系统性放松全身每个部位，进入深层放松', duration: 150 },
        ],
      },
    ]);

    // ==================== 力量 ====================
    await this.seedPlan(categories[2].id, {
      title: '全身基础力量',
      description: '适合初学者的全身自重力量训练，建立运动基础',
      difficulty: 'beginner',
      duration: 25,
      caloriesBurned: 200,
    }, [
      {
        phase: { name: '关节热身', type: PhaseType.WARMUP, sortOrder: 0, duration: 5 },
        exercises: [
          { name: '开合跳', description: '全身性热身运动，提升心率和体温', duration: 60 },
          { name: '手臂画圈', description: '双臂前后画大圈，活动肩关节', duration: 30 },
          { name: '原地高抬腿', description: '交替抬腿至腰部高度，激活下肢', duration: 60 },
        ],
      },
      {
        phase: { name: '力量训练', type: PhaseType.MAIN, sortOrder: 1, duration: 15 },
        exercises: [
          { name: '标准俯卧撑', description: '双手略宽于肩，身体保持一条直线，屈臂下压再推起', sets: 3, reps: 10 },
          { name: '徒手深蹲', description: '双脚与肩同宽，臀部后坐下蹲至大腿平行地面', sets: 3, reps: 15 },
          { name: '交替弓步蹲', description: '向前迈步屈膝下蹲，前后腿交替进行', sets: 3, reps: 10 },
          { name: '平板支撑', description: '前臂撑地，身体从头到脚成一条直线，收紧核心', duration: 30, sets: 3 },
        ],
      },
      {
        phase: { name: '拉伸放松', type: PhaseType.COOLDOWN, sortOrder: 2, duration: 5 },
        exercises: [
          { name: '腘绳肌拉伸', description: '坐姿单腿伸直前屈，每侧保持30秒', duration: 60 },
          { name: '胸部拉伸', description: '手臂抵墙转体，拉伸胸大肌和前三角肌', duration: 60 },
          { name: '全身放松', description: '仰卧深呼吸，放松所有肌肉群', duration: 60 },
        ],
      },
    ]);

    await this.seedPlan(categories[2].id, {
      title: '上下肢分化训练',
      description: '上肢和下肢交替训练，合理分配训练量，提升整体力量',
      difficulty: 'intermediate',
      duration: 40,
      caloriesBurned: 350,
    }, [
      {
        phase: { name: '动态热身', type: PhaseType.WARMUP, sortOrder: 0, duration: 7 },
        exercises: [
          { name: '开合跳', description: '全身性热身，快速提升心率', duration: 60 },
          { name: '俯卧撑热身', description: '轻松节奏做5个俯卧撑，激活上肢推力链', duration: 60 },
          { name: '深蹲热身', description: '慢速深蹲10次，唤醒腿部肌群', duration: 60 },
          { name: '肩部环绕', description: '双肩前后画圈，活动肩关节', duration: 30 },
        ],
      },
      {
        phase: { name: '分化训练', type: PhaseType.MAIN, sortOrder: 1, duration: 28 },
        exercises: [
          { name: '宽距俯卧撑', description: '双手宽于肩1.5倍，重点刺激胸大肌', sets: 4, reps: 12 },
          { name: '钻石俯卧撑', description: '双手拇指食指相触，重点锻炼肱三头肌', sets: 3, reps: 10 },
          { name: '反向划船', description: '仰卧抓杠，拉起身体至胸部触杠，锻炼背部', sets: 3, reps: 12 },
          { name: '保加利亚分腿蹲', description: '后脚搭在椅子上，前腿单腿下蹲，每侧交替', sets: 3, reps: 10 },
          { name: '臀桥', description: '仰卧屈膝，发力抬起臀部至身体成直线，挤压臀肌', sets: 3, reps: 15 },
          { name: '侧平板支撑', description: '单臂撑地侧身，保持身体成一条直线', duration: 30, sets: 3 },
        ],
      },
      {
        phase: { name: '整理放松', type: PhaseType.COOLDOWN, sortOrder: 2, duration: 5 },
        exercises: [
          { name: '胸椎旋转拉伸', description: '侧卧位打开胸腔，转动上半身，每侧30秒', duration: 60 },
          { name: '股四头肌拉伸', description: '站姿拉伸，手拉脚踝贴臀，每侧30秒', duration: 60 },
          { name: '全身放松呼吸', description: '平躺做5次深长呼吸，让身体完全放松', duration: 90 },
        ],
      },
    ]);

    await this.seedPlan(categories[2].id, {
      title: '高级复合力量',
      description: '多关节复合动作为主的高强度训练，适合有训练经验的运动者',
      difficulty: 'advanced',
      duration: 50,
      caloriesBurned: 500,
    }, [
      {
        phase: { name: '激活热身', type: PhaseType.WARMUP, sortOrder: 0, duration: 8 },
        exercises: [
          { name: '波比跳', description: '俯卧撑接跳跃，全身性爆发力热身', duration: 60 },
          { name: '蜘蛛人攀爬', description: '俯卧撑位交替提膝至手肘外侧，激活髋部和核心', duration: 60 },
          { name: '动态弓步转体', description: '弓步下蹲并向前腿侧旋转上身，活动全身', duration: 60 },
          { name: '肩胛骨俯卧撑', description: '在俯卧撑顶端位置做肩胛骨前伸后缩，激活前锯肌', duration: 60 },
        ],
      },
      {
        phase: { name: '复合力量训练', type: PhaseType.MAIN, sortOrder: 1, duration: 35 },
        exercises: [
          { name: '单臂俯卧撑', description: '单手撑地完成俯卧撑，极致的推力和核心挑战', sets: 3, reps: 6 },
          { name: '手枪深蹲', description: '单腿深蹲至最低点再站起，考验腿部力量和平衡', sets: 4, reps: 8 },
          { name: '引体向上', description: '正手握杠拉起身体至下巴过杠，锻炼背部和手臂', sets: 4, reps: 10 },
          { name: '倒立俯卧撑', description: '靠墙倒立位做俯卧撑，极强的肩部推力训练', sets: 3, reps: 8 },
          { name: '龙旗', description: '仰卧抓牢固定物，以肩为支点抬起全身至竖直', sets: 3, reps: 6 },
          { name: 'L形坐', description: '双手撑地，双腿伸直前举至水平，锻炼核心和髋屈肌', duration: 20, sets: 4 },
        ],
      },
      {
        phase: { name: '深度放松', type: PhaseType.COOLDOWN, sortOrder: 2, duration: 7 },
        exercises: [
          { name: '悬挂放松', description: '双手握杠悬挂，放松脊柱和肩关节', duration: 60 },
          { name: '鸽子式拉伸', description: '深度拉伸臀部和梨状肌，每侧保持45秒', duration: 90 },
          { name: '全身筋膜放松', description: '依次拉伸全身主要肌群，每个部位保持30秒', duration: 120 },
        ],
      },
    ]);

    // ==================== 拉伸 ====================
    await this.seedPlan(categories[3].id, {
      title: '办公室放松拉伸',
      description: '专为久坐办公人群设计，缓解颈肩腰背紧张，随时随地可做',
      difficulty: 'beginner',
      duration: 15,
      caloriesBurned: 60,
    }, [
      {
        phase: { name: '颈肩唤醒', type: PhaseType.WARMUP, sortOrder: 0, duration: 3 },
        exercises: [
          { name: '颈部侧屈', description: '头部缓慢向左右两侧倾斜，拉伸斜方肌上束', duration: 60 },
          { name: '肩部耸肩放松', description: '双肩上耸保持3秒后突然下沉放松，重复5次', duration: 45 },
          { name: '手腕旋转', description: '双手十指交叉，缓慢旋转手腕，缓解打字疲劳', duration: 45 },
        ],
      },
      {
        phase: { name: '坐姿拉伸', type: PhaseType.MAIN, sortOrder: 1, duration: 9 },
        exercises: [
          { name: '坐姿脊柱扭转', description: '坐在椅子上，双手扶椅背缓慢转体，拉伸腰背', duration: 90 },
          { name: '坐姿梨状肌拉伸', description: '翘二郎腿前倾，拉伸臀部深层肌肉', duration: 90 },
          { name: '胸部门框拉伸', description: '双手扶门框两侧，身体前倾，打开紧缩的胸部', duration: 60 },
          { name: '坐姿前屈', description: '坐姿双腿伸直，上身前倾尽量触碰脚尖', duration: 90 },
          { name: '猫牛式坐姿版', description: '坐在椅子上做猫牛式，弓背和塌腰交替，活动脊柱', duration: 90 },
        ],
      },
      {
        phase: { name: '眼部放松', type: PhaseType.COOLDOWN, sortOrder: 2, duration: 3 },
        exercises: [
          { name: '眼部放松操', description: '闭眼转动眼球，上下左右各5次，缓解用眼疲劳', duration: 60 },
          { name: '深呼吸冥想', description: '闭眼做10次深呼吸，放空大脑，释放压力', duration: 90 },
        ],
      },
    ]);

    await this.seedPlan(categories[3].id, {
      title: '全身深度拉伸',
      description: '系统性的全身拉伸训练，提升整体柔韧性和关节活动度',
      difficulty: 'intermediate',
      duration: 30,
      caloriesBurned: 100,
    }, [
      {
        phase: { name: '轻度热身', type: PhaseType.WARMUP, sortOrder: 0, duration: 5 },
        exercises: [
          { name: '原地踏步', description: '轻松原地踏步，微微提升体温', duration: 60 },
          { name: '手臂画圈', description: '由小到大画圈，激活肩关节全范围活动', duration: 60 },
          { name: '髋部画圈', description: '双手叉腰，髋部顺逆时针各画5个大圈', duration: 60 },
        ],
      },
      {
        phase: { name: '深度拉伸', type: PhaseType.MAIN, sortOrder: 1, duration: 20 },
        exercises: [
          { name: '站姿前屈', description: '双腿伸直缓慢前屈，双手触碰地面或脚踝', duration: 90 },
          { name: '低位弓步拉伸', description: '深弓步下沉髋部，拉伸髋屈肌和股四头肌', duration: 120 },
          { name: '蝴蝶式', description: '坐姿脚掌相对，膝盖外展下压，拉伸内收肌群', duration: 90 },
          { name: '坐姿扭转', description: '一腿伸直一腿屈膝跨过，向屈膝侧扭转上身', duration: 120 },
          { name: '鸽子式', description: '前腿屈膝置于身前，后腿伸直，深度拉伸臀部', duration: 120 },
          { name: '仰卧腿部拉伸', description: '仰卧抬腿用带子辅助拉伸腘绳肌和小腿', duration: 120 },
        ],
      },
      {
        phase: { name: '放松收尾', type: PhaseType.COOLDOWN, sortOrder: 2, duration: 5 },
        exercises: [
          { name: '仰卧扭转', description: '仰卧双膝倒向一侧，双臂展开，拉伸腰部', duration: 90 },
          { name: '快乐婴儿式', description: '仰卧抓脚外侧，膝盖向腋下拉，放松髋部和下背', duration: 90 },
          { name: '全身放松呼吸', description: '仰卧闭眼，缓慢深呼吸，感受身体的舒展', duration: 120 },
        ],
      },
    ]);

    await this.seedPlan(categories[3].id, {
      title: '运动后恢复拉伸',
      description: '针对高强度运动后的专业恢复拉伸，加速肌肉恢复，预防伤病',
      difficulty: 'advanced',
      duration: 40,
      caloriesBurned: 150,
    }, [
      {
        phase: { name: '慢走降温', type: PhaseType.WARMUP, sortOrder: 0, duration: 5 },
        exercises: [
          { name: '慢速步行', description: '以极慢速度步行，逐步降低心率至安静水平', duration: 120 },
          { name: '深呼吸调节', description: '配合步行进行4-7-8呼吸法（吸4秒、停7秒、呼8秒）', duration: 90 },
          { name: '全身抖动放松', description: '轻轻抖动四肢和躯干，释放肌肉紧张感', duration: 60 },
        ],
      },
      {
        phase: { name: '分区恢复拉伸', type: PhaseType.MAIN, sortOrder: 1, duration: 28 },
        exercises: [
          { name: '小腿泡沫轴滚压', description: '坐姿小腿放在泡沫轴上前后滚动，松解筋膜', duration: 120 },
          { name: '股四头肌侧卧拉伸', description: '侧卧位手拉脚踝贴近臀部，深度拉伸股四头肌', duration: 120 },
          { name: '腘绳肌PNF拉伸', description: '仰卧抬腿，交替收缩放松实现更深拉伸', duration: 150 },
          { name: '髋屈肌跪姿拉伸', description: '单膝跪地，前腿成90度，推髋前移拉伸髋屈肌', duration: 120 },
          { name: '胸椎旋转拉伸', description: '侧卧位上臂向对侧画弧，活动胸椎灵活性', duration: 120 },
          { name: '背阔肌拉伸', description: '跪姿双手前伸放在瑜伽球上，臀部后坐拉伸背阔肌', duration: 120 },
        ],
      },
      {
        phase: { name: '深度放松', type: PhaseType.COOLDOWN, sortOrder: 2, duration: 7 },
        exercises: [
          { name: '仰卧全身扫描', description: '从脚到头依次关注每个部位，主动放松紧张区域', duration: 180 },
          { name: '构造性休息体位', description: '仰卧屈膝，脚掌着地，双手放腹部，完全放松脊柱', duration: 120 },
        ],
      },
    ]);

    // ==================== HIIT ====================
    await this.seedPlan(categories[4].id, {
      title: 'HIIT入门燃脂',
      description: '适合初学者的低冲击HIIT训练，高效燃脂的同时保护关节',
      difficulty: 'beginner',
      duration: 20,
      caloriesBurned: 250,
    }, [
      {
        phase: { name: '热身准备', type: PhaseType.WARMUP, sortOrder: 0, duration: 4 },
        exercises: [
          { name: '原地踏步', description: '以中等速度原地踏步，逐步提升心率', duration: 60 },
          { name: '手臂摆动', description: '双臂前后大幅摆动，活动上肢关节', duration: 30 },
          { name: '侧向滑步', description: '左右侧步移动，激活臀中肌和内收肌', duration: 60 },
        ],
      },
      {
        phase: { name: '间歇训练', type: PhaseType.MAIN, sortOrder: 1, duration: 12 },
        exercises: [
          { name: '快速开合跳', description: '全力做开合跳30秒，休息15秒', duration: 30 },
          { name: '高抬腿跑', description: '原地快速高抬腿跑30秒，休息15秒', duration: 30 },
          { name: '深蹲跳', description: '深蹲到底后爆发跳起，轻柔落地缓冲', duration: 30 },
          { name: '登山者', description: '俯卧撑位交替快速提膝，锻炼核心和心肺', duration: 30 },
          { name: '前后跳', description: '双脚并拢前后跳跃，保持节奏和平衡', duration: 30 },
        ],
      },
      {
        phase: { name: '放松恢复', type: PhaseType.COOLDOWN, sortOrder: 2, duration: 4 },
        exercises: [
          { name: '慢走放松', description: '缓慢步行让心率回落', duration: 60 },
          { name: '站姿前屈', description: '双腿伸直前屈，放松腰背和腿后侧', duration: 60 },
          { name: '深呼吸', description: '双手过顶吸气，缓慢呼气放下双臂', duration: 60 },
        ],
      },
    ]);

    await this.seedPlan(categories[4].id, {
      title: '全身HIIT挑战',
      description: '全身性的中高强度间歇训练，全面提升心肺和肌肉耐力',
      difficulty: 'intermediate',
      duration: 30,
      caloriesBurned: 400,
    }, [
      {
        phase: { name: '动态热身', type: PhaseType.WARMUP, sortOrder: 0, duration: 5 },
        exercises: [
          { name: '开合跳', description: '逐渐加速的开合跳，全面热身', duration: 60 },
          { name: '弓步转体', description: '交替弓步并向前腿侧旋转上身', duration: 60 },
          { name: '俯卧撑到下犬式', description: '俯卧撑一个接下犬式伸展，反复交替', duration: 60 },
          { name: '原地冲刺', description: '原地快速跑步10秒，走路恢复10秒，重复3次', duration: 60 },
        ],
      },
      {
        phase: { name: 'HIIT主训练', type: PhaseType.MAIN, sortOrder: 1, duration: 20 },
        exercises: [
          { name: '波比跳', description: '完整波比跳：下蹲、跳出俯卧撑、收腿、跳起，全力完成', duration: 40 },
          { name: '跳跃弓步', description: '弓步位爆发跳起空中换脚，交替进行', duration: 30 },
          { name: '俯卧撑拍肩', description: '做一个俯卧撑后交替用手拍对侧肩膀', duration: 30 },
          { name: '深蹲推举', description: '深蹲站起时双手哑铃推举过头，复合全身发力', duration: 40 },
          { name: '平板支撑开合跳', description: '平板位双脚做开合跳动作，挑战核心稳定性', duration: 30 },
          { name: '滑冰跳', description: '侧向大步跳跃，模拟滑冰动作，锻炼横向爆发力', duration: 30 },
        ],
      },
      {
        phase: { name: '拉伸恢复', type: PhaseType.COOLDOWN, sortOrder: 2, duration: 5 },
        exercises: [
          { name: '慢走恢复', description: '缓慢步行，双臂自然摆动', duration: 90 },
          { name: '全身拉伸', description: '从上到下依次拉伸各大肌群', duration: 120 },
        ],
      },
    ]);

    await this.seedPlan(categories[4].id, {
      title: '极限HIIT冲击',
      description: '挑战身体极限的高强度训练，适合有良好体能基础的训练者',
      difficulty: 'advanced',
      duration: 40,
      caloriesBurned: 550,
    }, [
      {
        phase: { name: '全面激活', type: PhaseType.WARMUP, sortOrder: 0, duration: 7 },
        exercises: [
          { name: '慢跑热身', description: '中等配速慢跑，提升体温', duration: 120 },
          { name: '动态拉伸组合', description: '弓步走、踢腿、侧跨步的动态组合', duration: 90 },
          { name: '爆发力预激活', description: '3组5次垂直跳，唤醒快肌纤维', duration: 60 },
        ],
      },
      {
        phase: { name: '极限HIIT', type: PhaseType.MAIN, sortOrder: 1, duration: 28 },
        exercises: [
          { name: '双重波比跳', description: '波比跳加两个俯卧撑，最大化训练强度', duration: 45 },
          { name: '跳箱模拟', description: '爆发力深蹲跳到最高点，模拟跳箱动作', duration: 30 },
          { name: '蜘蛛人波比', description: '波比跳中加入蜘蛛人提膝，挑战全身协调', duration: 40 },
          { name: '单腿深蹲跳', description: '单腿深蹲后爆发跳起，交替双腿', duration: 30 },
          { name: '俯卧撑跳起', description: '俯卧撑后跳起成深蹲位，再跳回俯卧撑位', duration: 30 },
          { name: '冲刺跑', description: '原地全力冲刺跑20秒，极限心率挑战', duration: 20 },
        ],
      },
      {
        phase: { name: '深度恢复', type: PhaseType.COOLDOWN, sortOrder: 2, duration: 5 },
        exercises: [
          { name: '慢走降温', description: '逐步降低运动强度至完全平静', duration: 120 },
          { name: '全身深度拉伸', description: '重点拉伸参与训练的所有肌群', duration: 120 },
          { name: '呼吸冥想', description: '盘坐闭眼，进行3分钟正念呼吸，回归平静', duration: 90 },
        ],
      },
    ]);
  }
}
