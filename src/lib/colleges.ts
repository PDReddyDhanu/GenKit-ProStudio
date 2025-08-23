

export const STATES = {
    "Telangana": {
        "Medchal-Malkajgiri": [
            "Vidya Jyothi Institute of Technology",
            "VNR Vignana Jyothi Institute of Engineering and Technology",
            "CVR College of Engineering",
            "CMR College of Engineering & Technology",
            "Institute of Aeronautical Engineering",
            "Malla Reddy College of Engineering and Technology",
            "St. Martin's Engineering College",
            "MLR Institute of Technology",
            "Guru Nanak Institutions Technical Campus",
            "Geethanjali College of Engineering and Technology",
            "KG Reddy College of Engineering and Technology",
            "Kommuri Pratap Reddy Institute of Technology",
            "Sphoorthy Engineering College"
        ],
        "Hyderabad": [
            "Chaitanya Bharathi Institute of Technology",
            "Vasavi College of Engineering",
            "MVSR Engineering College",
            "Osmania University",
            "JNTU Hyderabad",
            "International Institute of Information Technology, Hyderabad (IIIT-H)",
            "Muffakham Jah College of Engineering and Technology",
            "Deccan College of Engineering and Technology",
            "Stanley College of Engineering and Technology for Women"
        ],
        "Ranga Reddy": [
            "Mahatma Gandhi Institute of Technology",
            "Gokaraju Rangaraju Institute of Engineering and Technology",
            "Vardhaman College of Engineering",
            "BV Raju Institute of Technology (BVRIT)",
            "CMR Institute of Technology",
            "Sri Indu College of Engineering and Technology",
            "Vignan Institute of Technology and Science",
            "Keshav Memorial Institute of Technology",
            "TKR College of Engineering and Technology"
        ],
        "Warangal": [
            "Kakatiya Institute of Technology & Science",
            "SR University",
            "Vaagdevi College of Engineering",
            "National Institute of Technology, Warangal (NITW)"
        ],
        "Karimnagar": [
            "JNTU Manthani"
        ],
        "Nalgonda": [
            "Mahatma Gandhi University"
        ],
        "Khammam": [
            "Khammam Institute of Technology & Science"
        ],
        "Sangareddy": [
            "Gitam University",
            "IIT Hyderabad"
        ]
    },
    "Andhra Pradesh": {
        "Visakhapatnam": [
            "Andhra University College of Engineering",
            "Gayatri Vidya Parishad College of Engineering",
            "Anil Neerukonda Institute of Technology and Sciences",
            "Vignan's Institute of Information Technology"
        ],
        "Guntur": [
            "RVR & JC College of Engineering",
            "K L University"
        ],
        "Krishna": [
            "Prasad V Potluri Siddhartha Institute of Technology"
        ],
        "Chittoor": [
            "Sri Venkateswara University College of Engineering",
            "Madanapalle Institute of Technology & Science"
        ],
        "Anantapur": [
            "JNTU Anantapur"
        ],
        "Kadapa": [
            "KSRM College of Engineering"
        ]
    },
    "Tamil Nadu": {
        "Chennai": [
            "Anna University",
            "IIT Madras",
            "Vellore Institute of Technology, Chennai",
            "SRM Institute of Science and Technology"
        ],
        "Coimbatore": [
            "PSG College of Technology",
            "Coimbatore Institute of Technology"
        ],
        "Vellore": [
            "Vellore Institute of Technology (VIT)"
        ],
        "Tiruchirappalli": [
            "National Institute of Technology, Tiruchirappalli (NIT Trichy)"
        ]
    },
    "Karnataka": {
        "Bengaluru": [
            "RV College of Engineering",
            "BMS College of Engineering",
            "PES University",
            "IIIT Bangalore"
        ],
        "Mangaluru": [
            "National Institute of Technology Karnataka (NITK), Surathkal"
        ],
        "Mysuru": [
            "Sri Jayachamarajendra College of Engineering (SJCE)"
        ]
    },
    "Maharashtra": {
        "Mumbai": [
            "IIT Bombay",
            "Veermata Jijabai Technological Institute (VJTI)"
        ],
        "Pune": [
            "College of Engineering, Pune (COEP)",
            "Pune Institute of Computer Technology (PICT)"
        ]
    },
    "Delhi": {
        "Delhi": [
            "IIT Delhi",
            "Delhi Technological University (DTU)",
            "Netaji Subhas University of Technology (NSUT)"
        ]
    },
    "Uttar Pradesh": {
        "Kanpur": [
            "IIT Kanpur"
        ],
        "Allahabad": [
            "Motilal Nehru National Institute of Technology (MNNIT)"
        ],
        "Varanasi": [
            "IIT (BHU) Varanasi"
        ]
    },
    "West Bengal": {
        "Kharagpur": [
            "IIT Kharagpur"
        ],
        "Kolkata": [
            "Jadavpur University",
            "Indian Institute of Engineering Science and Technology, Shibpur"
        ]
    }
};

export const COLLEGES = Object.values(STATES).flatMap(districts => Object.values(districts).flat());
