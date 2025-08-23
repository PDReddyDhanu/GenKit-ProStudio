

export const STATES = {
    "Telangana": {
        "Medchal-Malkajgiri": [
            "Vidya Jyothi Institute of Technology",
            "VNR Vignana Jyothi Institute of Engineering and Technology",
            "CMR College of Engineering & Technology",
            "Institute of Aeronautical Engineering",
            "Malla Reddy College of Engineering and Technology",
            "St. Martin's Engineering College",
            "MLR Institute of Technology",
            "Guru Nanak Institutions Technical Campus",
            "Geethanjali College of Engineering and Technology",
            "Kommuri Pratap Reddy Institute of Technology",
            "ACE Engineering College",
            "CMR Technical Campus",
            "Narasimha Reddy Engineering College",
            "Malla Reddy Engineering College",
            "St. Peter's Engineering College",
            "Nalla Malla Reddy Engineering College",
            "Medchal"
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
            "Stanley College of Engineering and Technology for Women",
            "Bhojreddy Engineering College for Women",
            "JNTUH College of Engineering Hyderabad",
            "Lords Institute of Engineering and Technology"
        ],
        "Ranga Reddy": [
            "CVR College of Engineering",
            "Mahatma Gandhi Institute of Technology",
            "Gokaraju Rangaraju Institute of Engineering and Technology",
            "Vardhaman College of Engineering",
            "BV Raju Institute of Technology (BVRIT)",
            "CMR Institute of Technology",
            "Sri Indu College of Engineering and Technology",
            "Vignan Institute of Technology and Science",
            "Keshav Memorial Institute of Technology",
            "TKR College of Engineering and Technology",
            "Sphoorthy Engineering College",
            "KG Reddy College of Engineering and Technology",
            "Sreyas Institute of Engineering and Technology",
            "Vidya Jyothi Institute of Technology",
            "Neil Gogte Institute of Technology",
            "Methodist College of Engineering and Technology",
            "Swami Vivekananda Institute of Technology"
        ],
        "Warangal": [
            "Kakatiya Institute of Technology & Science",
            "SR University",
            "Vaagdevi College of Engineering",
            "National Institute of Technology, Warangal (NITW)",
            "SR Engineering College",
            "Vaagdevi Engineering College",
            "Ramappa Engineering College",
            "Jayamukhi Institute of Technological Sciences",
            "Vinuthna Institute of Technology and Science",
            "Chaitanya Institute of Technology and Science",
            "Balaji Institute of Technology & Science"
        ],
        "Karimnagar": [
            "JNTU Manthani",
            "Jyothishmathi Institute of Technology and Science",
            "Vaageswari College of Engineering"
        ],
        "Nalgonda": [
            "Mahatma Gandhi University",
            "Nalgonda Institute of Technology and Science"
        ],
        "Khammam": [
            "Khammam Institute of Technology & Science",
            "Swaraj India Institute of Technology"
        ],
        "Sangareddy": [
            "Gitam University",
            "IIT Hyderabad",
            "Anurag Engineering College",
            "TRR College of Engineering"
        ],
        "Adilabad": [
            "Rajiv Gandhi University of Knowledge Technologies, Basar"
        ],
        "Nizamabad": [
            "Arkay College of Engineering and Technology",
            "Kakatiya Institute of Technology for Women"
        ],
        "Mahbubnagar": [
            "Jayaprakash Narayan College of Engineering"
        ],
        "Siddipet": [
            "Indur Institute of Engineering and Technology"
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
