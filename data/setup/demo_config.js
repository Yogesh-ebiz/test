const config = {
  user: [5, 7, 12, 63, 75, 80, 85, 86, 87, 88, 89, 90, 91, 92, 93, 140, 187, 188, 195, 196, 197, 198, 276, 277, 278, 279, 280, 281, 282, 283, 284, 285, 286, 288, 289, 290, 292, 3492, 3881, 3910, 4021, 4075, 4305, 5125, 5283, 6733, 7289, 7400],
  company: [25, 131, 156, 166, 200, 210, 219, 237, 246, 307, 337, 420, 424, 428, 453, 461, 465, 469, 473, 477, 481, 554, 555, 558, 567, 571, 573, 577, 584, 596, 698, 710, 802, 819, 844, 1002, 1048, 1049, 1055, 1084, 1087, 2552, 2553, 2554, 2555, 2556, 2643, 2644, 2645, 2646, 2647, 2648, 2649, 4390],
  employmentType: ["FULLTIME", "PARTTIME", "FREELANCE", "CONSULT", "REMOTE", "INTERN"],
  level: ["JUNIOR", "MID", "SENIOR", "MANAGER", "DIRECTOR", "EXECUTIVE"],
  jobFunction: ["SNM", "MNFT", "DATA", "CUST", "ADM", "ANAT", "DRI", "MNGR", "COM", "TECH", "FNMN", "TOUR"],
  // jobFunction: ["TECH"],
  promotion: [1,2],
  skill: [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15],
  industry: ["ACCOUNTING", "ALTERNATIVE_MEDICINE", "ANIMATION", "ART_CRAFT", "ARCHITECTURE", "BANKING", "BIOTECHNOLOGY", "AUTOMOTIVE", "BROADCAST_MEDIA", "BUSINESS_SUPPLIES", "AIRLINES_AVIATION", "ALTERNATIVE_DISPUTE_RESOLUTION", "APPAREL_FASHION", "AVIATION_AEROSPACE", "BUILDING_MATERIAL", "CAPITAL_MARKET", "CHEMICAL"],
  job: {
    // SNM: {
    //   JUNIOR: ["Sales Operations Manager", "Sales Strategy & Operations"],
    //   MID: ["Sales Manager", "Sales Automation Product Manager", "General Sales Manager"],
    //   MANAGER: ["Global Field Sales Manager, Brand Advocacy and Sales", "Sales and Marketing Operations Manager", "Onboarding & Sales Enablement Manager", "Regional Sales Manager", "Educational Sales Manager", "Ecommerce Sales & Marketing Manager"]
    // },
    TECH: {
      JUNIOR: ["iOS Developer", "Python Developer", "Android Developer"],
      MID: ["iOS Developer", "Python Developer", "Android Developer"],
      SENIOR: ["Staff Software Engineer, iOS", "Senior Android Engineer, Gold", "Sr. Android Developer", "iOS Senior Engineer, Mobile Developer Experience", "Senior Fullstack Engineer, Platform Adoption", "Senior Mobile Engineer, iOS", "Technical Lead", "Engineering Portfolio Lead",],
      MANAGER: ["Software Development Manager", "Technology Manager", "Sr Manager, Engineering - Platform", "Manager, Business Development", "Head of Technology", "Sr Director, Product Security Engineering & Operations", "Senior Director, Platform Development"],
      DIRECTOR: ["Business Development Executive", "Director, Technology Strategy", "Director, Technology", "Director, Studio Engineering", "Senior Director Of Engineering", "VP of Product Management - Platform"],
      EXECUTIVE: ["VP of Engineering", "Chief Technology Officer", "CTO"]
    }
  },
  country: ["US", "VN"],
  location: [
    {US: [{city: "Chicago", state: "Illinois"}, {city: "San Jose", state: "California"}, {city: "San Francisco", state: "California"}, {city: "San Diego", state: "California"}, {city: "Seattle", state: "Washington"}, {city: "Brooklyn", state: "New York"}, {city: "Philadelphia", state: "Pennsylvvania"}]},
    {VN: [{city: "Quan 1", state: "Ho Chi Minh"}, {city: "Quan 2", state: "Ho Chi Minh"}, {city: "Quan 3", state: "Ho Chi Minh"}, {city: "Quan 4", state: "Ho Chi Minh"}, {city: "Quan 5", state: "Ho Chi Minh"}, {city: "Quan Binh Thanh", state: "Ho Chi Minh"}, {city: "Quan Hoan Kiem", state: "Hanoi"}, {city: "Quan Ba Dinh", state: "Hanoi"}, {city: "Quan Dong Da", state: "Hanoi"}, {city: "Quan Hai Ba Trung", state: "Hanoi"}]}
  ],
  responsibility: {
    TECH: [
      "Experience partnering with product and design teams, as well as proficiency with UI/UX paradigms to build elegant user experiences",
      "Demonstrated ability to leverage lean methodologies to determine the product-market fit for new products",
      "Lead a diverse cross-functional group of engineers. Coach and mentor, form processes, and push the team to execution excellence",
      "Locate and hire world-class talent to grow your team",
      "Share best practices with other engineering leaders across the company and help drive your teams to be a center of excellence",
      "Lead the team in designing, developing, debugging, and operating multiple mission critical systems",
      "Champion the New Product Introduction process.",
      "Act as decision maker for high level / high impact engineering issues.",
      "Develop and support a culture of continuous improvement and best practices within the Engineering organization.",
      "Maintain a climate of fostering a high level of employee motivation, performance, and commitment. Oversees staffing plans and reviews work plans and schedules for each phase of a project in accordance with time limitations and funding.",
      "Represents organization with major customers and stakeholders.",
      "Build, lead and manage the cross-functional engineering team dedicated to the ongoing advancement of the Engineering team and product roadmaps.",
      "Work with the Engineering Management Team to conduct ongoing skills assessment and proactively address potential skills gaps. Lead and mentor the engineering management team to continue to develop strong technical leaders.",
      "Leads from the front to deliver a world class employee service and technology experience",
      "Hires, develops, and retains the best talent in the industry",
      "Leads the IT asset management team, including the global desktop, laptop and cell phone fleet; software and infrastructure asset management",
      "Possesses an excellent grasp of key operational drivers and delivers all KPI's, including end user satisfaction, security and cost to service metrics",
      "Engages deeply with internal customers to listen and action on feedback"
    ]
  },
  qualification: {
    TECH: [
      "7+ years of software development experience with 3+ years of people management",
      "Experience in data driven and metrics driven release processes",
      "Experience with API design and architecture",
      "Experience with Application Development",
      "Experience developing cross platform software",
      "Excellent verbal and written communication skills",
      "Knowledge of large-scale distributed systems and client-server architectures.",
      "10+ years of relevant software development and engineering management experience",
      "Masters or PhD in Computer Science",
      "Background in data modelling, real-time distributed systems or high performance software systems.",
      "Knowledge of full life-cycle software engineering practices including coding standards, testing, source control management, and operations",
      "Expertise in Java with 4+ years of experience in Android development.",
      "Embracing the challenges of building data intensive, highly responsive, and fault tolerant apps in the constrained environment of a smartphone.",
      "Passion for developing scalable, well-designed software that improves people’s lives globally.",
      "Experience building at least one amazing Android app with a team from start to shipment.",
      "10+ years of Software Development Experience",
      "5+ years of experience leading cross-functional development teams, both onsite and remote. (10+ Reports)",
      "Experience in building teams, hiring, firing, coaching, and motivating staff."
    ]
  }

}

module.exports = config;
