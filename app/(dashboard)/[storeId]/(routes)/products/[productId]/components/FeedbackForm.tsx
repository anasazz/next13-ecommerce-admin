import * as z from "zod";
import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { Trash } from "lucide-react";
import { Product } from "@prisma/client";
import axios from "axios";
import { useParams, useRouter } from "next/navigation"

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { Heading } from "@/components/ui/heading";
import { AlertModal } from "@/components/modals/alert-modal";

const formSchema = z.object({
  rating: z.number().min(1),
  comment: z.string().min(10),
});

type FeedbackFormValues = z.infer<typeof formSchema>;

interface FeedbackFormProps {
  productId: string;
  initialData: Product | null;
}

export const FeedbackForm: React.FC<FeedbackFormProps> = ({ productId, initialData }) => {
  const params = useParams();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [feedbacks, setFeedbacks] = useState([]); // State to store feedbacks

  const title = initialData ? "Edit feedback" : "Create feedback";
  const description = initialData ? "Edit a feedback." : "Add a new feedback";
  const toastMessage = initialData ? "Feedback updated." : "Feedback created.";
  const action = initialData ? "Save changes" : "Create";

  const form = useForm<FeedbackFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      rating: 5,
      comment: "",
    },
  });

  const fetchFeedbacks = async () => {
    try {
      const response = await axios.get(`/api/${params.storeId}/feedback?productId=${productId}`);
      setFeedbacks(response.data);
    } catch (error) {
      toast.error("Failed to fetch feedbacks.");
    }
  };

  const onDelete = async (feedbackId) => {
    try {
      setLoading(true);
      

      // Make a DELETE request to delete the feedback entry
      const response = await axios.delete(`/api/${params.storeId}/feedback/${feedbackId}/`);

      if (response.status === 201) {
        toast.success("Feedback deleted.");
        fetchFeedbacks(); // Fetch feedbacks again after deleting one
      } else {
        toast.error("Failed to delete feedback.");
      }
    } catch (error) {
      toast.error("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedbacks(); // Fetch feedbacks when the component mounts
  }, []);

  const onSubmit = async (data: FeedbackFormValues) => {
    try {
      setLoading(true);

      const feedbackData = { productId, ...data };
      const response = await axios.post(`/api/${params.storeId}/feedback`, feedbackData);

      if (response.status === 201) {
        toast.success(toastMessage);
        fetchFeedbacks(); // Fetch feedbacks again after creating a new one
      } else {
        toast.error("Failed to create feedback.");
      }
    } catch (error) {
      toast.error("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  // Rest of your component remains the same
  // ...

  return (
    <>
      <Separator />
      {/* <AlertModal isOpen={open} onClose={() => setOpen(false)} onConfirm={onDelete} loading={loading} /> */}
      <div className="mt-5 flex items-center justify-between">
        <Heading title={title} description={description} />
        {initialData && (
          <Button disabled={loading} variant="destructive" size="sm" onClick={() => setOpen(true)}>
            <Trash className="h-4 w-4" />
          </Button>
        )}
      </div>
      <Separator />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 w-full">
          {/* Form fields */}
          <div className="md:grid md:grid-cols-3 gap-8">
            {/* Rating field */}
            <FormField
              control={form.control}
              name="rating"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rating</FormLabel>
                  <FormControl>
                    <Input disabled={loading} type="number" placeholder="1" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Comment field */}
            <FormField
              control={form.control}
              name="comment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Comment</FormLabel>
                  <FormControl>
                    <Input disabled={loading} placeholder="Feedback comment" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          {/* Submit button */}
          <Button disabled={loading} className="ml-auto" type="submit">
            {action}
          </Button>
        </form>
      </Form>
      {/* Display feedbacks */}
      <div>
        <h2>Feedbacks:</h2>
        <ul >
          {feedbacks.map((feedback) => (
            <>
            <li className='py-5' key={feedback.id}>
              <p>Rating:  {feedback.rating}</p>
              <p>Comment: {feedback.comment}</p>
              <Button
                disabled={loading}
                variant="destructive"
                size="sm"
                onClick={() => onDelete(feedback.id)}
              >
                Delete
              </Button>
   

            </li>
               <Separator />
            </>
          ))}
        </ul>
      </div>
    </>
  );
};
