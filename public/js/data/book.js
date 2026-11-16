// The demo ebook: "The Small Appetite Protein Plan".
// Every fact has a numbered source. Short examples start with "Picture this:".
// General information only, not medical advice.
// Blocks: ['h', text] heading, ['p', text], ['list', [items]], ['try', text], ['safety', text],
// ['redflag', text], ['picture', text], ['kitchen', text] (creator edition only).

export const SOURCES = [
  { n: 1, t: 'U.S. Food and Drug Administration. Wegovy (semaglutide) injection, prescribing information.', u: 'https://www.accessdata.fda.gov/drugsatfda_docs/label/2021/215256s000lbl.pdf' },
  { n: 2, t: 'U.S. Food and Drug Administration. Zepbound (tirzepatide) injection, prescribing information.', u: 'https://www.accessdata.fda.gov/drugsatfda_docs/label/2023/217806s000lbl.pdf' },
  { n: 3, t: 'Wilding JPH, et al. Once-weekly semaglutide in adults with overweight or obesity (STEP 1). New England Journal of Medicine, 2021.', u: 'https://www.nejm.org/doi/full/10.1056/NEJMoa2032183' },
  { n: 4, t: 'Jastreboff AM, et al. Tirzepatide once weekly for the treatment of obesity (SURMOUNT-1). New England Journal of Medicine, 2022.', u: 'https://www.nejm.org/doi/full/10.1056/NEJMoa2206038' },
  { n: 5, t: 'National Institute of Diabetes and Digestive and Kidney Diseases. Prescription medications to treat overweight and obesity.', u: 'https://www.niddk.nih.gov/health-information/weight-management/prescription-medications-treat-overweight-obesity' },
  { n: 6, t: 'NHS. Semaglutide: medicine information.', u: 'https://www.nhs.uk/medicines/semaglutide/' },
  { n: 7, t: 'National Academies. Dietary Reference Intakes for Energy, Carbohydrate, Fiber, Fat, Fatty Acids, Cholesterol, Protein, and Amino Acids, 2005.', u: 'https://nap.nationalacademies.org/catalog/10490' },
  { n: 8, t: 'Bauer J, et al. Evidence-based recommendations for optimal dietary protein intake in older people (PROT-AGE). JAMDA, 2013.', u: 'https://doi.org/10.1016/j.jamda.2013.05.021' },
  { n: 9, t: 'Paddon-Jones D, Rasmussen BB. Dietary protein recommendations and the prevention of sarcopenia. Current Opinion in Clinical Nutrition and Metabolic Care, 2009.', u: 'https://doi.org/10.1097/MCO.0b013e32831cef8b' },
  { n: 10, t: 'Jager R, et al. International Society of Sports Nutrition position stand: protein and exercise. JISSN, 2017.', u: 'https://doi.org/10.1186/s12970-017-0177-8' },
  { n: 11, t: 'Cruz-Jentoft AJ, et al. Sarcopenia: revised European consensus on definition and diagnosis. Age and Ageing, 2019.', u: 'https://doi.org/10.1093/ageing/afy169' },
  { n: 12, t: 'MedlinePlus. Protein in diet.', u: 'https://medlineplus.gov/ency/article/002467.htm' },
  { n: 13, t: 'Harvard T.H. Chan School of Public Health, The Nutrition Source. Protein.', u: 'https://nutritionsource.hsph.harvard.edu/what-should-you-eat/protein/' },
  { n: 14, t: 'U.S. Department of Agriculture. FoodData Central.', u: 'https://fdc.nal.usda.gov/' },
  { n: 15, t: 'National Academies. Dietary Reference Intakes for Water, Potassium, Sodium, Chloride, and Sulfate, 2005.', u: 'https://nap.nationalacademies.org/catalog/10925' },
  { n: 16, t: 'MedlinePlus. Fiber.', u: 'https://medlineplus.gov/ency/article/002136.htm' },
  { n: 17, t: 'U.S. Department of Agriculture and HHS. Dietary Guidelines for Americans, 2020 to 2025.', u: 'https://www.dietaryguidelines.gov/' },
  { n: 18, t: 'U.S. Department of Health and Human Services. Physical Activity Guidelines for Americans, 2nd edition.', u: 'https://health.gov/our-work/nutrition-physical-activity/physical-activity-guidelines' },
  { n: 19, t: 'Centers for Disease Control and Prevention. Adult activity: an overview.', u: 'https://www.cdc.gov/physical-activity-basics/guidelines/adults.html' },
  { n: 20, t: 'Rubino D, et al. Effect of continued weekly semaglutide vs placebo on weight loss maintenance (STEP 4). JAMA, 2021.', u: 'https://doi.org/10.1001/jama.2021.3224' },
  { n: 21, t: 'Mayo Clinic. Dehydration: symptoms and causes.', u: 'https://www.mayoclinic.org/diseases-conditions/dehydration/symptoms-causes/syc-20354086' },
  { n: 22, t: 'U.S. Food and Drug Administration. Medications containing semaglutide marketed for type 2 diabetes or weight loss.', u: 'https://www.fda.gov/drugs/postmarket-drug-safety-information-patients-and-providers/medications-containing-semaglutide-marketed-type-2-diabetes-or-weight-loss' },
  { n: 23, t: 'NHS. Eat well.', u: 'https://www.nhs.uk/live-well/eat-well/' },
  { n: 24, t: 'Academy of Nutrition and Dietetics. Find a nutrition expert.', u: 'https://www.eatright.org/find-a-nutrition-expert' },
];

export const DISCLAIMER = 'General information, not medical advice. Talk with your doctor or a registered dietitian before you change how you eat, move or take your medicine.';

export const CHAPTERS = [
  {
    id: 'ch1', title: 'Start Here',
    short: 'Your shot made you less hungry. That is the point of it. This book helps you eat enough protein anyway, in small, easy bites.',
    blocks: [
      ['p', 'If you take a GLP-1 medicine like semaglutide or tirzepatide, you may have noticed something strange. Food you used to love now feels like too much. A full plate looks like a mountain. Some days you forget to eat until the afternoon.'],
      ['p', 'That is not a mistake. These medicines lower appetite and help people feel full sooner [5]. In large studies, people lost a lot of weight on them [3, 4]. But eating less food often means eating less protein too, and protein is the part of your plate that helps protect your muscles.'],
      ['h', 'What this book is'],
      ['p', 'This is a short, practical guide. It does not ask you to count every gram forever. It gives you one number to aim for, a simple order to eat your food in, and small plates that fit a small appetite.'],
      ['list', ['Chapters 2 to 4 explain why protein matters now and how much to aim for.', 'Chapters 5 to 8 show you how to actually eat it, even on low days.', 'Chapter 9 covers moving your body to keep muscle.', 'Chapter 10 tells you when to call your doctor.', 'The last chapter is a 14-day plan you can follow one day at a time.']],
      ['h', 'What this book is not'],
      ['p', 'It is not a diet, and it is not medical advice. Your doctor knows your health. Use this book to have better talks with them, not to replace them.'],
      ['h', 'How to use it'],
      ['p', 'Read Chapters 1 to 4 in one sitting if you can. They are short. Then use the rest like a kitchen guide: open it when you are standing at the fridge wondering what to eat. Most chapters end with a "Try tonight" box, one small thing you can do in five minutes. Doing one of them is worth more than reading three chapters.'],
      ['picture', 'Picture this: it is noon, you have had coffee and half a cracker, and you feel fine. By the end of this book you will know the one small thing to eat right then, and why it helps.'],
      ['try', 'Tonight, look in your fridge and write down three foods you already have that contain protein. Eggs, yogurt, cheese, beans and leftover chicken all count. That list is your starting point.'],
    ],
    remember: ['Less hunger is how the medicine works.', 'Less food can mean less protein.', 'Small, steady steps beat big plans.'],
  },
  {
    id: 'ch2', title: 'Why Your Appetite Changed',
    short: 'GLP-1 medicines slow how fast your stomach empties and turn down hunger signals. Small meals feel big, and some foods may not sit well.',
    blocks: [
      ['p', 'GLP-1 is a hormone your gut makes after you eat. Medicines like semaglutide copy it, and tirzepatide copies it plus a second gut hormone called GIP. Together they help you feel full sooner and stay full longer [5].'],
      ['h', 'Fullness that arrives early'],
      ['p', 'Many people notice they feel full after just a few bites. Food also stays in the stomach longer than before, which is part of why a heavy or greasy meal can feel bad now.'],
      ['h', 'Common stomach side effects'],
      ['p', 'The official drug labels list nausea, diarrhea, vomiting and constipation among the most common side effects [1, 2]. These are often worse when the dose goes up, and they often ease with time. For feeling sick on semaglutide, the NHS suggests sticking to simple meals and avoiding rich or spicy food [6].'],
      ['picture', 'Picture this: you sit down to a big bowl of pasta with cream sauce, eat a third of it and feel queasy for two hours. The same evening, a small plate of chicken, a few green beans and a spoon of rice would likely have sat much better.'],
      ['h', 'Why this matters for protein'],
      ['p', 'When there is only room for a few bites, the first bites matter most. If those bites are crackers or chips, protein gets left behind. The rest of this book is about making sure the first bites count.'],
      ['h', 'Your own pattern'],
      ['p', 'Your appetite may change from day to day and from week to week. A short note of how hungry you feel each day, kept for two weeks, can show your own pattern. Once you know which days are easier, you can plan your bigger protein meals for those days and keep the low day list from Chapter 6 for the rest.'],
      ['try', 'At your next meal, put your fork down between bites and notice the first moment you feel satisfied, not stuffed. Stop there. Note how you feel an hour later.'],
      ['safety', 'If you cannot keep food or water down for a day, or you feel dizzy and very thirsty, call your doctor. See Chapter 10.'],
    ],
    remember: ['The medicine makes you feel full sooner.', 'Stomach upset is common, often early on.', 'When room is small, protein goes first.'],
  },
  {
    id: 'ch3', title: 'Why Protein Matters Now',
    short: 'When you lose weight, you lose some muscle too, not only fat. Eating enough protein and staying active are the two best tools to protect it.',
    blocks: [
      ['p', 'Weight loss is not only fat loss. In the STEP 1 study of semaglutide, a smaller group of people had body scans, and the scans showed that part of the weight they lost was lean mass, which includes muscle [3].'],
      ['h', 'Why muscle is worth protecting'],
      ['p', 'Muscle helps you climb stairs, carry groceries and keep your balance. Experts use the word sarcopenia for losing muscle strength and muscle mass, and it is linked with falls and loss of independence, especially with age [11].'],
      ['p', 'This matters for anyone losing weight, but it matters most for older adults, who have less muscle to spare and often find it harder to build back. That is why many of the protein numbers in the next chapter are higher for people over 65 [8].'],
      ['p', 'Protein gives your body the building blocks it needs to repair and keep muscle [12]. Studies in older adults suggest that getting enough protein, spread across the day, helps support muscle [8, 9].'],
      ['h', 'The two levers you control'],
      ['list', ['Eat enough protein each day, in a few small doses.', 'Use your muscles, with some kind of strength work most weeks (Chapter 9).']],
      ['p', 'Neither lever needs a gym membership or special powders. They need a plan that fits your new appetite.'],
      ['h', 'More than the number on the scale'],
      ['p', 'It is easy to judge progress only by the scale. But two people can lose the same weight and end up with very different strength. Noticing how you feel climbing stairs, carrying bags or getting up from the floor gives you a second, kinder way to see how you are doing.'],
      ['h', 'What about when you stop the medicine?'],
      ['p', 'In the STEP 4 study, people who switched from semaglutide to a placebo regained weight on average, while those who kept taking it continued to lose [20]. Habits you build now, like eating protein first, are habits you keep whatever happens with your medicine.'],
      ['try', 'Stand up from a chair five times without using your hands, slowly. Notice how it feels. Try again in two weeks. It is a simple way to check in with your strength.'],
    ],
    remember: ['Some weight lost can be muscle.', 'Protein and movement protect muscle.', 'Habits last longer than any one medicine.'],
  },
  {
    id: 'ch4', title: 'Your Protein Number',
    short: 'The basic daily amount for adults is 0.8 grams of protein per kilogram of body weight. Many experts suggest more for older adults. Ask your doctor which number fits you.',
    blocks: [
      ['p', 'Protein needs are usually measured in grams per kilogram of body weight per day. A kilogram is about 2.2 pounds.'],
      ['h', 'The starting numbers'],
      ['list', ['The basic recommended amount for healthy adults is 0.8 grams per kilogram per day [7].', 'A group of experts on aging suggested 1.0 to 1.2 grams per kilogram per day for people over 65, and more for people who are active or ill [8].', 'For people who exercise a lot, a sports nutrition group suggests 1.4 to 2.0 grams per kilogram per day [10].']],
      ['p', 'These numbers come from different groups looking at different people, so they do not all agree. That is normal. Your doctor or a dietitian can help you pick a target that fits your body, your kidneys and your goals.'],
      ['h', 'Do the math once'],
      ['p', 'Take your weight in pounds and divide by 2.2 to get kilograms. Multiply by the number your doctor suggests. Write the answer on a sticky note.'],
      ['p', 'A number only helps if you remember it. Put the sticky note on the fridge or the bathroom mirror. Some people split the daily number into three small goals, one for each meal or snack, so the target never feels out of reach.'],
      ['picture', 'Picture this: someone who weighs 180 pounds is about 82 kilograms. At 0.8 grams per kilogram, that is about 65 grams a day. At 1.2, it is about 98 grams a day.'],
      ['h', 'Spread it out'],
      ['p', 'Researchers who study muscle and aging suggest spreading protein across meals, with about 25 to 30 grams of high quality protein at a meal [9]. On a small appetite, a full 30 grams at once can be hard. Three or four smaller doses still move you toward your number.'],
      ['try', 'Work out your number tonight using your weight and 0.8 grams per kilogram as a floor. Bring it to your next appointment and ask if a higher number is right for you.'],
      ['safety', 'If you have kidney disease, do not raise your protein without talking to your doctor first.'],
    ],
    remember: ['Start with 0.8 grams per kilogram as a floor.', 'Older and active adults may need more.', 'Spread protein across the day.'],
  },
  {
    id: 'ch5', title: 'Protein First, on Small Plates',
    short: 'Eat the protein on your plate first, while you still have room. Use smaller plates so a normal portion does not look like a mountain.',
    blocks: [
      ['p', 'Protein first is the simplest rule in this book. When a meal arrives, eat a few bites of the protein before anything else. If you only manage half the plate, the half you ate was the part that matters most for your muscles.'],
      ['h', 'Where protein lives'],
      ['p', 'Good sources include fish, poultry, eggs, dairy, beans, lentils, tofu, nuts and seeds [12, 13]. Here are rough amounts, taken from the USDA food database [14]. Brands and recipes vary, so check labels when you can.'],
      ['list', ['1 large egg: about 6 grams', '1 cup of milk: about 8 grams', '3 ounces of cooked chicken breast: about 25 grams', '3 ounces of canned tuna: about 20 grams', 'Half a cup of cottage cheese: about 12 grams', 'Half a cup of cooked lentils: about 9 grams']],
      ['h', 'Small plates on purpose'],
      ['p', 'A salad plate or a small bowl makes a modest portion look complete. Build it like this: a palm sized piece of protein, a small pile of something colorful, and a spoon of a starch you enjoy.'],
      ['picture', 'Picture this: two scrambled eggs and a slice of cheese on a small plate with a few cherry tomatoes. It looks like a real meal, and it holds roughly 19 grams of protein.'],
      ['h', 'Soft and easy textures'],
      ['p', 'On queasy days, soft and cool foods are often easier: yogurt, cottage cheese, smooth soups with beans, flaked fish, eggs. Greasy and very rich foods are the ones many people find hardest after starting these medicines.'],
      ['h', 'Make the first bites easy'],
      ['p', 'Cut protein into small, ready to eat pieces when you cook, so it is easy to grab later. Leftover chicken in a small container, eggs that are already boiled and peeled, and a tub of yogurt with a spoon beside it all remove a step between you and the food. On a small appetite, every step you remove helps.'],
      ['try', 'Swap your dinner plate for a salad plate for the next three dinners. Eat the protein first. Write down how much you finished.'],
    ],
    remember: ['First bites go to protein.', 'Small plates make small meals feel whole.', 'Soft, cool foods help on queasy days.'],
  },
  {
    id: 'ch6', title: 'Easy Wins for Low Days',
    short: 'Some days you will not want to eat at all. Keep a short list of no cook, small protein snacks you can manage even then.',
    blocks: [
      ['p', 'Low days happen, often in the first days after a dose or a dose increase. On those days, a full meal may be out of reach. The goal is not perfection. It is to get some protein in rather than none.'],
      ['h', 'The low day list'],
      ['list', ['A small cup of Greek yogurt', 'A cheese stick', 'A hard boiled egg', 'A glass of milk or a protein drink you like', 'A few spoons of cottage cheese with fruit', 'A small handful of nuts, if they sit well']],
      ['p', 'Keep two or three of these ready at all times. When you notice it is past lunch and you have not eaten, reach for one without thinking.'],
      ['h', 'Little and often'],
      ['p', 'Several small snacks can add up. Three snacks of about 10 grams each give you 30 grams of protein, the same as a large meal, without the full feeling.'],
      ['picture', 'Picture this: you wake up queasy the day after your shot. At 10 you have half a cup of milk. At 1 you eat a cheese stick. At 4 you manage a small yogurt. None of it felt like a meal, but together it was a real start.'],
      ['h', 'Set a gentle reminder'],
      ['p', 'Hunger signals are quieter on these medicines, so a phone reminder at 10, 1 and 4 can do the job your stomach used to do.'],
      ['h', 'When even snacks are hard'],
      ['p', 'If solid food is not working at all, a protein drink sipped slowly may be the easiest choice for that day. If you cannot keep anything down, it is no longer a protein problem. It is a reason to call your doctor (Chapter 9).'],
      ['try', 'Pick your three low day snacks tonight and put them at eye level in your fridge.'],
      ['redflag', 'If you have severe stomach pain that does not go away, with or without vomiting, get medical help right away. The drug labels warn about this [1, 2].'],
    ],
    remember: ['Some protein beats none.', 'Keep ready to eat snacks at eye level.', 'Use reminders when hunger is quiet.'],
  },
  {
    id: 'ch7', title: 'Drinks, Water and Fiber',
    short: 'Drinks can carry protein when food will not. Water and fiber help with two common problems on these medicines: dehydration and constipation.',
    blocks: [
      ['h', 'Protein you can sip'],
      ['p', 'When chewing feels like work, drinking is often easier. Milk, kefir, soy milk and ready made protein shakes all count. Sip slowly over 20 or 30 minutes rather than all at once.'],
      ['h', 'Water'],
      ['p', 'The National Academies set general daily total water intakes of about 3.7 liters for men and 2.7 liters for women, counting water from all drinks and food [15]. You may need more or less. On these medicines, vomiting or diarrhea can lose fluid quickly, and the drug labels warn that dehydration can lead to kidney problems [1, 2].'],
      ['p', 'Signs of dehydration include strong thirst, dark yellow urine, peeing less often, feeling tired and feeling dizzy [21].'],
      ['h', 'Fiber'],
      ['p', 'Constipation is one of the common side effects listed on the labels [1, 2]. Fiber, along with enough fluid, can help keep you regular [16]. The Dietary Guidelines suggest about 14 grams of fiber for every 1,000 calories you eat [17]. On a small appetite that may be hard, so add it slowly: berries, oats, beans, lentils, chia seeds, vegetables.'],
      ['p', 'Beans and lentils are a double win because they bring protein and fiber together [13].'],
      ['h', 'Easy ways to drink more'],
      ['p', 'Keep a glass of water where you sit most. Add a slice of lemon or cucumber if plain water feels boring. Sip between meals instead of drinking a lot with food, so your small stomach has room for the meal. Soups and broths count toward your fluids too, since the general intakes count water from food as well as drinks [15].'],
      ['picture', 'Picture this: a small bowl of lentil soup and a glass of water at lunch. Protein, fiber and fluid, all in a meal that is soft and easy to eat.'],
      ['try', 'Fill a water bottle tonight and keep it where you will see it in the morning. Notice how much is gone by lunch.'],
      ['safety', 'Add fiber a little at a time and drink fluid with it. Adding a lot at once can cause bloating.'],
    ],
    remember: ['Drinks can carry protein.', 'Watch for signs of dehydration.', 'Fiber plus fluid helps with constipation.'],
  },
  {
    id: 'ch8', title: 'Move to Keep Muscle',
    short: 'Protein gives muscles the building blocks. Strength work gives them the reason to stay. Start small and build up.',
    blocks: [
      ['p', 'Eating protein helps, but muscles also need to be used. The Physical Activity Guidelines for Americans suggest that adults get at least 150 minutes a week of moderate activity, like brisk walking, plus muscle strengthening activity on 2 or more days a week [18, 19].'],
      ['h', 'What counts as strength work'],
      ['list', ['Standing up from a chair without using your hands', 'Wall push ups', 'Carrying grocery bags', 'Resistance bands', 'Lifting weights, if you already know how', 'Heavy gardening, like digging']],
      ['h', 'Start where you are'],
      ['p', 'If you are new to this, start with one or two moves for a few minutes, twice a week. Add a little more every week or two. Any amount of activity is better than none, and the guidelines say some benefits start with small amounts [18].'],
      ['picture', 'Picture this: every evening while the kettle boils, you do ten chair stands and ten wall push ups. It takes four minutes, and over a month it becomes a habit.'],
      ['h', 'Pair it with protein'],
      ['p', 'A simple habit: eat one of your small protein snacks after your strength work. It ties the two levers from Chapter 3 together.'],
      ['h', 'Tie it to something you already do'],
      ['p', 'The easiest workouts are the ones attached to a habit you already have. Chair stands while the kettle boils, wall push ups after brushing your teeth, a short walk after lunch. Small, regular moves are easier to keep than long sessions you have to plan for.'],
      ['try', 'Tomorrow, do ten chair stands. If ten is too many, do five. Write down the number.'],
      ['safety', 'If you have heart, joint or balance problems, ask your doctor which kinds of activity are safe for you before you start.'],
    ],
    remember: ['Muscles need protein and use.', 'Aim for strength work on 2 or more days a week.', 'Start small and add a little at a time.'],
  },
  {
    id: 'ch9', title: 'When to Call Your Doctor',
    short: 'Most side effects are mild and ease with time. Some are not. Know the warning signs and call your doctor if you see them.',
    blocks: [
      ['p', 'This chapter is short on purpose. Read it, then keep it somewhere you can find it.'],
      ['redflag', 'Get medical help right away for: severe stomach pain that does not go away, with or without vomiting; signs of an allergic reaction like swelling of the face or throat or trouble breathing; or pain in the upper right belly with fever or yellow skin or eyes. The drug labels list pancreatitis, gallbladder problems and serious allergic reactions as possible risks [1, 2].'],
      ['h', 'Call your doctor soon if'],
      ['list', ['You cannot keep fluids down for a day', 'You have signs of dehydration, like dark urine or dizziness [21]', 'You are eating so little that you feel weak most days', 'You are losing weight much faster than your doctor expected', 'Your mood drops or you have thoughts of harming yourself']],
      ['h', 'Get your medicine from a real pharmacy'],
      ['p', 'The FDA has warned about unapproved and compounded versions of these medicines and about fake products sold online [22]. Use a licensed pharmacy and a prescription from your own doctor.'],
      ['h', 'Get extra help with food'],
      ['p', 'A registered dietitian can build an eating plan around your medicine, your health and the foods you like [24]. Ask your doctor for a referral.'],
      ['h', 'Questions to bring to your next visit'],
      ['list', ['What daily protein number is right for me?', 'Is my kidney health okay for more protein?', 'Which side effects should make me call you?', 'Can you refer me to a dietitian?', 'How should I change my eating when my dose goes up?']],
      ['try', 'Save your doctor\'s phone number and your pharmacy\'s number in your phone tonight, with the words "GLP-1 questions" next to them.'],
    ],
    remember: ['Severe or lasting stomach pain needs help now.', 'Dehydration is worth a call.', 'Use a licensed pharmacy.'],
  },
  {
    id: 'ch10', title: 'The 14-Day Protein Plan',
    short: 'Fourteen small days. Each one adds one habit. By day 14 you will have a protein first routine that fits a small appetite.',
    blocks: [
      ['p', 'Do one day at a time. If a day goes badly, repeat it. There is no prize for speed.'],
      ['p', 'If you miss a day, do not try to catch up by eating more the next day. Just pick up where you left off. The habits matter more than any single day.'],
      ['h', 'Week one: build the base'],
      ['list', ['Day 1: Write your protein number on a sticky note (Chapter 4).', 'Day 2: Stock your three low day snacks at eye level (Chapter 6).', 'Day 3: Eat protein first at one meal.', 'Day 4: Swap to a salad plate at dinner.', 'Day 5: Set three phone reminders: 10, 1 and 4.', 'Day 6: Drink one protein drink slowly, over 20 minutes.', 'Day 7: Rest. Look back at what worked.']],
      ['h', 'Week two: make it stick'],
      ['list', ['Day 8: Protein first at two meals.', 'Day 9: Ten chair stands, or five (Chapter 8).', 'Day 10: Add one fiber food: berries, oats or beans.', 'Day 11: Fill a water bottle before bed and finish it by lunch.', 'Day 12: Strength work again, then a protein snack.', 'Day 13: Cook one batch of something easy, like boiled eggs or lentil soup.', 'Day 14: Read your sticky note number. Add up a normal day. How close are you?']],
      ['picture', 'Picture this: on day 14 you notice you reach for yogurt at 10 without a reminder. The habit is working on its own.'],
      ['h', 'After day 14'],
      ['p', 'Keep the habits that helped and drop the ones that did not. Share what you learned with your doctor or dietitian at your next visit. Healthy eating guides like the NHS Eatwell advice can help you widen your meals over time [23].'],
      ['p', 'Your appetite, your dose and your goals will keep changing. Come back to this plan whenever they do. Read Chapter 4 again, check your number with your doctor, and run the 14 days again if it helps. Each time, it should feel a little easier, because the habits are already yours.'],
      ['try', 'Print the tracker that comes with this book, or draw 14 boxes on a sheet of paper, and check off day 1 tonight.'],
    ],
    remember: ['One habit a day.', 'Repeat a day if you need to.', 'Bring what you learn to your doctor.'],
  },
];

// The creator edition adds a short "From the creator's kitchen" box to each chapter,
// built only from the creator's real posts (see creator.js).
export const KITCHEN_BOXES = {
  ch5: 'From Maya\'s kitchen (demo): "My rule since month two: three bites of the protein before I touch anything else on the plate." (from her reel "Protein first, always", post 2)',
  ch6: 'From Maya\'s kitchen (demo): her "fridge door five" is a cheese stick, two boiled eggs, a cottage cheese cup, a small kefir and a yogurt. (from her reel "What I eat on shot day", post 4)',
  ch7: 'From Maya\'s kitchen (demo): "I sip a small kefir over my whole morning commute. That is 8 or 9 grams before I even get to work." (from her reel "Sip your protein", post 6)',
  ch8: 'From Maya\'s kitchen (demo): "Ten chair stands while the kettle boils. I started with four." (from her reel "Kettle workout", post 7)',
};

export function bookWords(chapters = CHAPTERS) {
  let n = 0;
  const count = s => String(s).trim().split(/\s+/).filter(Boolean).length;
  for (const c of chapters) {
    n += count(c.title) + count(c.short) + c.remember.reduce((a, r) => a + count(r), 0);
    for (const [, v] of c.blocks) n += Array.isArray(v) ? v.reduce((a, x) => a + count(x), 0) : count(v);
  }
  return n;
}

// Before and after: the same paragraph in plain voice and in the creator's voice.
// Facts and source numbers are kept exactly.
export const VOICE_SAMPLE = {
  chapter: 'Chapter 5: Protein First, on Small Plates',
  plain: 'Protein first is the simplest rule in this book. When a meal arrives, eat a few bites of the protein before anything else. If you only manage half the plate, the half you ate was the part that matters most for your muscles. Good sources include fish, poultry, eggs, dairy, beans, lentils, tofu, nuts and seeds [12, 13].',
  voiced: 'Okay, here is the one rule I would tattoo on my fridge: protein first. Plate lands, you eat three bites of the protein before you even look at the rest. Full after half? Fine. The half you ate was the half your muscles care about. Your protein crew: fish, chicken, eggs, dairy, beans, lentils, tofu, nuts and seeds [12, 13]. That is the whole trick.',
};
