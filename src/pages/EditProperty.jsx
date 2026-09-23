import { useEffect, useState } from 'react'
import Form from '../components/add-property/Form'
import { useParams } from 'react-router-dom';
import useSupabaseClient from '@/backend/supabase/supabase';
import { Spin } from 'antd';
import { useAuth } from '@clerk/clerk-react';
import { Link } from 'react-router-dom';
export default function EditProperty() {
    const [property, setProperty] = useState(null)
    const [status, setStatus] = useState('loading');
    const { id } = useParams();
    const supabase = useSupabaseClient();
    const { userId, isLoaded } = useAuth();
    useEffect(() => {
        const fetchHouseData = async () => {
            try {
                const { data, error } = await supabase
                    .from('properties')
                    .select()
                    .eq('property_id', id)
                    .eq('seller_id', userId)
                    .maybeSingle();

                if (error) {
                    console.error("Error fetching property data:", error);
                    setStatus('error');
                    return;
                } else {
                    setProperty(data);
                    setStatus(data ? 'ready' : 'not-found');
                }
            } catch (err) {
                console.error("Error fetching data from Supabase:", err);
                setStatus('error');
            }
        };
        if (isLoaded && !userId) {
            setStatus('not-found');
        } else if (supabase && id && isLoaded && userId) {
            fetchHouseData();
        }
    }, [id, supabase, userId, isLoaded]);
    return (
        <>
            {status === 'loading' && <Spin fullscreen size='large' />}
            {status === 'ready' && <Form property={property} id={id} />}
            {(status === 'error' || status === 'not-found') && <div className="site-container property-edit-error"><h1>Property unavailable</h1><p>We could not open this listing for editing. Check that it belongs to your account.</p><Link to="/MyProperty">Back to my properties</Link></div>}
        </>
    )
}
