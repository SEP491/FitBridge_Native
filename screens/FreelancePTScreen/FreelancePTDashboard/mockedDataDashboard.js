export const mockedDataDashboard = [
    {
        todaySessions: 10,
        pendingBookingRequests: 10,
        rating: 4.5,
        completionRate: 80,
        availableBalance: 100000000,
        pendingBalance: 100000000,
        monthLyRevenue: {
            totalRevenue: 100000000,
            compareToLastMonth: "130%",
        },
        
        activeCustomers: {
            totalCustomers: 50,
            newCustomerOfThisMonth: 10,
        },
        sessionStatusReport: {
            totalSessions: 100, 
            completedSessions: 80,
            cancelledSessions: 10,
            bookedSessions: 10,
        },
        bestSellerPackage: [
            {
                packageName: "Tap co duoi",
                imageURL: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRrtUh-uIFZ06lOpOZpI34hiWDo-OkpODILOA&s",
                totalPurchase: 200,
                totalIncome: 100000000,
                compareToLastMonth: "130%",
            },
            {
                packageName: "Tap co tren",
                imageURL: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRrtUh-uIFZ06lOpOZpI34hiWDo-OkpODILOA&s",
                totalPurchase: 200,
                totalIncome: 100000000,
                compareToLastMonth: "130%",
            },
            {
                packageName: "Tap co ben",
                imageURL: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRrtUh-uIFZ06lOpOZpI34hiWDo-OkpODILOA&s",
                totalPurchase: 150,
                totalIncome: 75000000,
                compareToLastMonth: "95%",
            }
        ],
        upcomingSchedule: [
            {
                bookingId: 1,
                bookingName: "Session 1",
                startTime: "18:12:00",
                endTime: "19:12:00",
                customerPurchasedId: "0199fe8d-c757-7b13-940a-9c79d0797e55",
                customerName: "John Doe",
                customerAvatarURL: "https://cloud.appwrite.io/v1/storage/buckets/68ed0ff4001069f7a10f/files/8fc5f53b-ce91-4c6d-a458-126f9fc3a09f/view?project=68ed0fdd0037253031b8",
                sessionStatus: "completed",
            },
            {
                bookingId: 2,
                bookingName: "Session 2",
                startTime: "19:12:00",
                endTime: "20:12:00",
                customerPurchasedId: "0199fe8d-c757-7b13-940a-9c79d0797e55",
                customerName: "Jane Doe",
                customerAvatarURL: "https://cloud.appwrite.io/v1/storage/buckets/68ed0ff4001069f7a10f/files/8fc5f53b-ce91-4c6d-a458-126f9fc3a09f/view?project=68ed0fdd0037253031b8",
                sessionStatus: "cancelled",
            },
        ],
        
    }
]