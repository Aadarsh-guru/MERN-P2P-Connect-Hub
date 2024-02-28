import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

const Home: React.FC = () => {

    return (
        <div className="h-[calc(100vh-80px)] w-full flex justify-center items-center">
            <Card className="md:w-[500px] max-w-[90%] min-h-[300px] shadow-md dark:bg-gray-800">
                <CardHeader className="text-center">
                    <div className="flex flex-col items-center">
                        <img
                            className="h-16 w-16 mb-2 object-cover rounded-full"
                            src="/logo.png"
                            alt="logo"
                        />
                        <CardTitle className="leading-8" >Welcome to <span className="text-blue-500">Connect Hub!</span> 👋🏻</CardTitle>
                    </div>
                    <CardDescription>Experience the joy of meaningful connections.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-center">
                        <h2 className="text-lg font-bold mb-2">"Explore new horizons, connect with purpose."</h2>                        <p className="text-gray-700 dark:text-gray-500 text-sm">
                            Start connecting with people around the world through our secure peer-to-peer video chat platform. Experience seamless communication and make new friends right from the comfort of your home.
                        </p>
                    </div>
                </CardContent>
                <CardFooter className="flex justify-center">
                    <Link to={'/room'} >
                        <Button className="bg-blue-500 transition-all active:scale-95 hover:bg-blue-600 text-white py-2 px-4 rounded-lg shadow-lg">
                            Let's begin <ArrowRight className="inline-block ml-2" />
                        </Button>
                    </Link>
                </CardFooter>
            </Card>
        </div>
    );
};

export default Home;
