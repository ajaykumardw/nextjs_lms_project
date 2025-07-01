// Next Imports
import dynamic from 'next/dynamic'

// Component Imports
import CourseDetail from '@components/courses/page'

const StoreDetailsTab = dynamic(() => import('@views/apps/ecommerce/settings/store-details'))
const PaymentsTab = dynamic(() => import('@views/apps/ecommerce/settings/payments'))
const CheckoutTab = dynamic(() => import('@views/apps/ecommerce/settings/checkout'))
const ShippingDeliveryTab = dynamic(() => import('@views/apps/ecommerce/settings/ShippingDelivery'))
const LocationsTab = dynamic(() => import('@views/apps/ecommerce/settings/locations'))
const NotificationsTab = dynamic(() => import('@views/apps/ecommerce/settings/Notifications'))

// Vars
const tabContentList = () => ({
    'store-detail': <StoreDetailsTab />,
    payments: <PaymentsTab />,
    checkout: <CheckoutTab />,
    'shipping-delivery': <ShippingDeliveryTab />,
    locations: <LocationsTab />,
    notifications: <NotificationsTab />
})

const MyCourses = () => {
    return <CourseDetail tabContentList={tabContentList()} />
}

export default MyCourses
