

export const STATES = {
    "Telangana": {
        "Medchal-Malkajgiri": [
            "Vidya Jyothi Institute of Technology",
            "VNR Vignana Jyothi Institute of Engineering and Technology",
            "CVR College of Engineering",
            "CMR College of Engineering & Technology"
        ],
        "Hyderabad": [
            "Chaitanya Bharathi Institute of Technology",
            "Vasavi College of Engineering",
            "MVSR Engineering College"
        ],
        "Ranga Reddy": [
            "Mahatma Gandhi Institute of Technology",
            "Gokaraju Rangaraju Institute of Engineering and Technology"
        ],
        "Warangal": [
            "Kakatiya Institute of Technology & Science"
        ]
    },
    "Andhra Pradesh": {
        "Visakhapatnam": [
            "Andhra University College of Engineering",
            "Gayatri Vidya Parishad College of Engineering"
        ],
        "Guntur": [
            "RVR & JC College of Engineering"
        ],
        "Krishna": [
            "Prasad V Potluri Siddhartha Institute of Technology"
        ]
    }
};

export const COLLEGES = Object.values(STATES).flatMap(districts => Object.values(districts).flat());
